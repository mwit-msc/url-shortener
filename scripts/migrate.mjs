import { Client } from 'pg'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const quote = value => '"' + value.replaceAll('"', '""') + '"'

// Read catalog definitions only. Application rows are never read or changed.
export async function readSchema(client, schema) {
  await client.query("SELECT set_config('search_path', quote_ident($1) || ',pg_catalog', false)", [schema])
  const queries = {
    columns: `SELECT c.relname, a.attname, t.typname, a.atttypmod, a.attnotnull, pg_get_expr(d.adbin,d.adrelid)
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      JOIN pg_attribute a ON a.attrelid=c.oid JOIN pg_type t ON t.oid=a.atttypid
      LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
      WHERE n.nspname=$1 AND c.relkind='r' AND c.relname<>'_prisma_migrations' AND a.attnum>0 AND NOT a.attisdropped ORDER BY c.relname,a.attname`,
    enums: `SELECT t.typname, array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
      FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace JOIN pg_enum e ON e.enumtypid=t.oid
      WHERE n.nspname=$1 GROUP BY t.typname ORDER BY t.typname`,
    constraints: `SELECT c.relname, k.conname, pg_get_constraintdef(k.oid,true)
      FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname=$1 AND c.relname<>'_prisma_migrations' ORDER BY c.relname,k.conname`,
    indexes: `SELECT c.relname, x.relname, i.indisunique, i.indisvalid, am.amname,
      ARRAY(SELECT pg_get_indexdef(i.indexrelid,s,true) FROM generate_series(1,i.indnatts) s), pg_get_expr(i.indpred,i.indrelid)
      FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      JOIN pg_class x ON x.oid=i.indexrelid JOIN pg_am am ON am.oid=x.relam
      WHERE n.nspname=$1 AND c.relname<>'_prisma_migrations' ORDER BY c.relname,x.relname`,
  }
  const result = {}
  for (const [kind, sql] of Object.entries(queries)) {
    const data = await client.query({ text: sql, values: [schema], rowMode: 'array' })
    result[kind] = data.rows
  }
  return result
}

const key = (kind, row) => JSON.stringify(row.slice(0, kind === 'enums' ? 1 : 2))

function covers(actual, expected) {
  for (const [kind, entries] of Object.entries(expected)) {
    const found = new Map(actual[kind].map(row => [key(kind, row), row]))
    for (const row of entries.values()) {
      const match = found.get(key(kind, row))
      // Extra tables, columns, indexes, and enum labels are preserved.
      const equivalent = kind === 'enums'
        ? match && row[1].every(label => match[1].includes(label))
        : JSON.stringify(match) === JSON.stringify(row)
      if (!equivalent) return `${kind}: ${row.slice(0, kind === 'enums' ? 1 : 2).join('.')}`
    }
  }
  return null
}

async function prisma(args, root, configPath, databaseUrl) {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [join(projectRoot, 'node_modules/prisma/build/index.js'), ...args, '--config', configPath], { cwd: root, stdio: 'inherit', env: { ...process.env, DATABASE_URL: databaseUrl } })
    child.once('error', reject)
    child.once('exit', status => done(status))
  })
  if (code !== 0) throw new Error(`Prisma ${args.join(' ')} failed; application startup stopped.`)
}

export async function runMigrations({ databaseUrl = process.env.DATABASE_URL, root = projectRoot, configPath = join(root, 'prisma.config.ts') } = {}) {
  if (!databaseUrl) throw new Error('DATABASE_URL is required.')
  const url = new URL(databaseUrl)
  const schema = url.searchParams.get('schema') || 'public'
  url.searchParams.delete('schema')
  const client = new Client({ connectionString: url.href })
  await client.connect()
  try {
    await client.query("SET lock_timeout = '60s'")
    // Serialize adoption + deployment, including concurrent initial startups.
    // Prisma retains its own separate migration advisory lock as well.
    await client.query('SELECT pg_advisory_lock(194736281, hashtext($1))', [schema])
    const hasHistory = await client.query(`SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname='_prisma_migrations'`, [schema])
    const history = hasHistory.rowCount ? (await client.query(`SELECT migration_name,finished_at,rolled_back_at FROM ${quote(schema)}."_prisma_migrations"`)).rows : []
    // Never convert a failed/unfinished migration into a successful baseline.
    if (!history.some(row => !row.finished_at && !row.rolled_back_at)) {
      const actual = await readSchema(client, schema)
      if (actual.columns.length) {
        const contract = JSON.parse(await readFile(join(root, 'prisma/migration-baseline.json'), 'utf8'))
        const expected = Object.fromEntries(Object.keys(actual).map(kind => [kind, new Map()]))
        const applied = new Set(history.filter(row => row.finished_at && !row.rolled_back_at).map(row => row.migration_name))
        const pendingBaseline = []
        for (const migration of contract) {
          const sql = await readFile(join(root, 'prisma/migrations', migration.name, 'migration.sql'))
          if (createHash('sha256').update(sql).digest('hex') !== migration.checksum) throw new Error(`Baseline contract is stale for ${migration.name}; startup stopped.`)
          for (const [kind, rows] of Object.entries(migration.definitions)) {
            for (const row of rows) expected[kind].set(key(kind, row), row)
          }
          if (applied.has(migration.name)) continue
          const mismatch = covers(actual, expected)
          if (mismatch) {
            if (!applied.size && !pendingBaseline.length) throw new Error(`Cannot adopt this schema: missing or different ${mismatch}. No application data was changed.`)
            break // Remaining, genuinely missing changes go through deploy.
          }
          pendingBaseline.push(migration.name)
        }
        for (const name of pendingBaseline) {
          console.log(`Verified existing schema; recording ${name} as applied.`)
          await prisma(['migrate', 'resolve', '--applied', name], root, configPath, databaseUrl)
        }
      }
    }
    console.log('Applying pending database migrations...')
    await prisma(['migrate', 'deploy'], root, configPath, databaseUrl)
  } finally {
    // Session advisory locks are released on disconnect, including failures.
    await client.end()
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await runMigrations() } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

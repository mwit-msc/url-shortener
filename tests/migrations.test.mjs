import test from 'node:test'
import assert from 'node:assert/strict'
import { Client } from 'pg'
import { readdir, readFile, mkdtemp, cp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { runMigrations } from '../scripts/migrate.mjs'

// These tests deliberately create/drop isolated fixture schemas. Reject all
// production database names even if TEST_DATABASE_URL is configured by mistake.
const base = process.env.TEST_DATABASE_URL
if (base && !new URL(base).pathname.slice(1).startsWith('mwit_migration_test')) throw new Error('Use a disposable database named mwit_migration_test*.')
const root = resolve(import.meta.dirname, '..')
const names = (await readdir(join(root, 'prisma/migrations'))).filter(name => /^\d/.test(name)).sort()
let sequence = 0

async function fixture(t, count) {
  const schema = `migration_test_${process.pid}_${sequence++}`
  const url = new URL(base)
  url.searchParams.set('schema', schema)
  const client = new Client({ connectionString: base })
  await client.connect()
  await client.query(`CREATE SCHEMA "${schema}"`)
  t.after(async () => { await client.query(`DROP SCHEMA "${schema}" CASCADE`); await client.end() })
  await client.query(`SET search_path = "${schema}",pg_catalog`)
  for (const name of names.slice(0, count)) await client.query(await readFile(join(root, 'prisma/migrations', name, 'migration.sql'), 'utf8'))
  return { client, databaseUrl: url.href }
}

async function seed(client) {
  await client.query(`INSERT INTO users (id,email,role,"updatedAt") VALUES ('retained-user','existing@mwit.ac.th','ADMIN','2025-01-02');
    INSERT INTO domains (id,domain,"updatedAt") VALUES ('retained-domain','mwit.link','2025-01-02');
    INSERT INTO links (id,"shortCode","originalUrl",title,"domainId","userId",clicks,"updatedAt") VALUES ('retained-link','existing','https://example.com/existing?x=1&y=2','ข้อมูลเดิม','retained-domain','retained-user',42,'2025-01-02');
    CREATE TABLE extra_data (value TEXT); INSERT INTO extra_data VALUES ('preserve unrelated data');`)
  return snapshot(client)
}

async function snapshot(client) {
  const result = {}
  for (const table of ['users', 'domains', 'links', 'extra_data']) result[table] = (await client.query(`SELECT * FROM "${table}" ORDER BY 1`)).rows
  return result
}

test('reproduces P3005, adopts an untracked legacy schema, and adds QR without changing data', { skip: !base }, async t => {
  const f = await fixture(t, 4)
  const before = await seed(f.client)
  const old = spawnSync(process.execPath, [join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { cwd: root, encoding: 'utf8', env: { ...process.env, DATABASE_URL: f.databaseUrl } })
  assert.notEqual(old.status, 0)
  assert.match(old.stdout + old.stderr, /P3005/)
  await runMigrations({ databaseUrl: f.databaseUrl })
  assert.deepEqual(await snapshot(f.client), before)
  assert.equal((await f.client.query('SELECT * FROM qr_generator_config')).rowCount, 0)
  assert.equal((await f.client.query('SELECT * FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rowCount, 5)
  const history = (await f.client.query('SELECT id,finished_at FROM _prisma_migrations ORDER BY id')).rows
  await runMigrations({ databaseUrl: f.databaseUrl })
  assert.deepEqual((await f.client.query('SELECT id,finished_at FROM _prisma_migrations ORDER BY id')).rows, history)
  assert.deepEqual(await snapshot(f.client), before)
})

test('adopts a fully current untracked schema and preserves saved QR settings', { skip: !base }, async t => {
  const f = await fixture(t, 5)
  const before = await seed(f.client)
  await f.client.query(`INSERT INTO qr_generator_config (id,enabled,"generatorUrl",options,"updatedAt") VALUES ('default',true,'https://qr.example.com','{"logo":"none"}','2025-01-02')`)
  const settings = (await f.client.query('SELECT * FROM qr_generator_config')).rows
  await runMigrations({ databaseUrl: f.databaseUrl })
  assert.deepEqual(await snapshot(f.client), before)
  assert.deepEqual((await f.client.query('SELECT * FROM qr_generator_config')).rows, settings)
})

test('adopts the schema actually created by db push without migration history', { skip: !base }, async t => {
  const f = await fixture(t, 0)
  const pushed = spawnSync(process.execPath, [join(root, 'node_modules/prisma/build/index.js'), 'db', 'push'], { cwd: root, encoding: 'utf8', env: { ...process.env, DATABASE_URL: f.databaseUrl } })
  assert.equal(pushed.status, 0, pushed.stdout + pushed.stderr)
  const before = await seed(f.client)
  await runMigrations({ databaseUrl: f.databaseUrl })
  assert.deepEqual(await snapshot(f.client), before)
  assert.equal((await f.client.query('SELECT * FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rowCount, 5)
})

test('fresh databases and partially present legacy schemas get pending migrations', { skip: !base }, async t => {
  for (const count of [0, 1]) {
    const f = await fixture(t, count)
    const before = count ? await seed(f.client) : null
    await runMigrations({ databaseUrl: f.databaseUrl })
    assert.equal((await f.client.query('SELECT * FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rowCount, 5)
    if (before) assert.deepEqual(await snapshot(f.client), { ...before, domains: before.domains.map(domain => ({ ...domain, restriction: 'EVERYONE' })) })
  }
})

test('concurrent initial startups do not double-apply migrations', { skip: !base }, async t => {
  const f = await fixture(t, 4)
  const before = await seed(f.client)
  await Promise.all([runMigrations({ databaseUrl: f.databaseUrl }), runMigrations({ databaseUrl: f.databaseUrl })])
  assert.equal((await f.client.query('SELECT * FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rowCount, 5)
  assert.deepEqual(await snapshot(f.client), before)
})

test('resumes after only part of an existing baseline was recorded', { skip: !base }, async t => {
  const f = await fixture(t, 4)
  const before = await seed(f.client)
  const partial = spawnSync(process.execPath, [join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'resolve', '--applied', names[0]], { cwd: root, encoding: 'utf8', env: { ...process.env, DATABASE_URL: f.databaseUrl } })
  assert.equal(partial.status, 0, partial.stdout + partial.stderr)
  await runMigrations({ databaseUrl: f.databaseUrl })
  assert.equal((await f.client.query('SELECT * FROM _prisma_migrations WHERE finished_at IS NOT NULL')).rowCount, 5)
  assert.deepEqual(await snapshot(f.client), before)
})

test('incompatible schemas are not falsely marked applied or changed', { skip: !base }, async t => {
  const f = await fixture(t, 4)
  const before = await seed(f.client)
  await f.client.query('ALTER TABLE links ALTER COLUMN "originalUrl" TYPE VARCHAR(2048)')
  await assert.rejects(runMigrations({ databaseUrl: f.databaseUrl }), /Cannot adopt this schema/)
  assert.deepEqual(await snapshot(f.client), before)
  assert.equal((await f.client.query("SELECT to_regclass('_prisma_migrations') AS relation")).rows[0].relation, null)
})

test('a real failed migration remains failed and blocks later startup', { skip: !base }, async t => {
  const f = await fixture(t, 4)
  const before = await seed(f.client)
  const temporary = await mkdtemp(join(tmpdir(), 'mwit-migration-failure-'))
  t.after(() => rm(temporary, { recursive: true, force: true }))
  await cp(join(root, 'prisma'), join(temporary, 'prisma'), { recursive: true })
  const broken = join(temporary, 'prisma/migrations/20990101000000_test_failure')
  await cp(join(root, 'prisma/migrations', names[4]), broken, { recursive: true })
  await writeFile(join(broken, 'migration.sql'), 'INTENTIONALLY INVALID SQL;')
  await writeFile(join(temporary, 'prisma.config.ts'), `export default {schema:${JSON.stringify(join(root, 'prisma/schema.prisma'))}, migrations:{path:${JSON.stringify(join(temporary, 'prisma/migrations'))}}, datasource:{url:process.env.DATABASE_URL}}`)
  await assert.rejects(runMigrations({ databaseUrl: f.databaseUrl, root: temporary }), /failed/)
  await assert.rejects(runMigrations({ databaseUrl: f.databaseUrl, root: temporary }), /failed/)
  const failed = (await f.client.query("SELECT finished_at,rolled_back_at FROM _prisma_migrations WHERE migration_name='20990101000000_test_failure'")).rows
  assert.equal(failed.length, 1)
  assert.equal(failed[0].finished_at, null)
  assert.equal(failed[0].rolled_back_at, null)
  assert.deepEqual(await snapshot(f.client), before)
})

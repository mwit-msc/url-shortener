import { createHash } from 'node:crypto'

// Public URL shapes from the school's sample, with synthetic opaque IDs.
// Never commit people's real Drive IDs or saved-link destinations as fixtures.
const id = (name, length) => Array.from({ length: Math.ceil(length / 43) }, (_, index) =>
  createHash('sha256').update(`mwit-synthetic-${name}-${index}`).digest('base64url')).join('').slice(0, length)
const folder = `https://drive.google.com/drive/folders/${id('folder', 33)}?usp=sharing`
export const directLinkExamples = [
  ['Canva link', `https://canva.link/${id('canva-link', 15).toLowerCase()}`],
  ['Drive file', `https://drive.google.com/file/d/${id('file', 33)}/view?usp=sharing`],
  ['Drive folder', folder],
  ['Drive folder (duplicate)', folder],
  ['Sheets (drivesdk)', `https://docs.google.com/spreadsheets/d/${id('sheet1', 44)}/edit?usp=drivesdk`],
  ['Sheets (drivesdk)', `https://docs.google.com/spreadsheets/d/${id('sheet2', 44)}/edit?usp=drivesdk`],
  ['Canva design', `https://www.canva.com/design/${id('design', 11)}/${id('design-key', 22)}/view?utm_content=${id('design', 11)}&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h${id('tracking', 10).toLowerCase()}`],
  ['Apps Script', `https://script.google.com/a/macros/mwit.ac.th/s/${id('script', 80)}/exec`],
  ['YouTube', 'https://youtu.be/dQw4w9WgXcQ'],
  ['Docs (drivesdk)', `https://docs.google.com/document/d/${id('doc1', 44)}/edit?usp=drivesdk`],
  ['Docs (drivesdk)', `https://docs.google.com/document/d/${id('doc2', 44)}/edit?usp=drivesdk`],
  ['Google Forms', `https://forms.gle/${id('form', 17)}`],
  ['Sheets (empty query)', `https://docs.google.com/spreadsheets/d/${id('sheet3', 44)}/edit?`],
  ['Drive folder', `https://drive.google.com/drive/folders/${id('folder2', 33)}?usp=sharing`],
  ['Open House', 'https://openhouse.mwit.ac.th/register/walk-in'],
  ['Sheets (drivesdk)', `https://docs.google.com/spreadsheets/d/${id('sheet4', 44)}/edit?usp=drivesdk`],
  ['Forms (dialog)', `https://docs.google.com/forms/d/e/${id('form-e', 56)}/viewform?usp=dialog`],
  ['Sheets (sharing)', `https://docs.google.com/spreadsheets/d/${id('sheet5', 44)}/edit?usp=sharing`],
]

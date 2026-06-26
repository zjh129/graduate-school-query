import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const dir = 'd:/frond-end/graduate_school_query/data'
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.xls') || f.endsWith('.xlsx'))
for (const f of files) {
  const full = path.join(dir, f)
  console.log('\n=== file:', f, 'size:', fs.statSync(full).size)
  try {
    const buf = fs.readFileSync(full)
    const wb = XLSX.read(buf, { type: 'buffer', cellDates: true })
    console.log('ok sheets:', wb.SheetNames)
  } catch (e) {
    console.log('FAIL (type:buffer):', e.message)
  }
  try {
    const wb2 = XLSX.readFile(full, { cellDates: true })
    console.log('ok2 sheets:', wb2.SheetNames)
    for (const sn of wb2.SheetNames) {
      const ws = wb2.Sheets[sn]
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false })
      console.log(`-- sheet rows=${aoa.length}`)
      aoa.slice(0, 6).forEach((r, i) => console.log(i, JSON.stringify(r)))
      console.log('...')
      aoa.slice(-3).forEach((r, i) => console.log(aoa.length - 3 + i, JSON.stringify(r)))
    }
  } catch (e) {
    console.log('FAIL (readFile):', e.message)
  }
}
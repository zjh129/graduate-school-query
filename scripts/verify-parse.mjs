import { parseAOA, deriveProvinces, deriveSubjects } from '../src/utils/excelLoader.ts'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const buf = fs.readFileSync(path.resolve('d:/frond-end/graduate_school_query/public/xls/schools.xls'))
const wb = XLSX.read(buf, { type: 'buffer', cellDates: true })
const ws = wb.Sheets[wb.SheetNames[0]]
const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true })
const list = parseAOA(aoa)
console.log('parsed count:', list.length)
console.log('provinces:', deriveProvinces(list))
console.log('subjects:', deriveSubjects(list))
console.log('sample 3:')
list.slice(0, 3).forEach((s) => console.log(JSON.stringify(s)))
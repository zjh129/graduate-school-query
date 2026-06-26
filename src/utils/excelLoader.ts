/**
 * 院校数据加载器 - 支持多种格式
 *
 * 数据源（按优先级依次查找，命中即停）：
 *   1. /data/schools.csv
 *   2. /data/schools.md   (Markdown 表格)
 *   3. /data/schools.json
 *   4. /data/schools.xlsx / /data/schools.xls
 *
 * 表头约定（兼容中英文别名，缺失字段可空着）：
 *   标识码 / 学校名称 / 投档分数 / 最低位次 / 省份 / 城市 /
 *   院校层次 / 院校性质 / 院校特色 / 招生类型 / 选科要求 / 主管部门
 *
 * 注：「院校特色」为多值，单元格内用 `|` 分隔，例如 `985|211|双一流`
 */
import * as XLSX from 'xlsx'
import type { ISchool, ISchoolFeature, ISchoolLevel, ISchoolNature, IAdmissionType, ISubjectReq } from '@/types/school'
import {
  ALL_FEATURES,
  ALL_NATURES,
  ALL_LEVELS,
  ALL_ADMISSION_TYPES,
  ALL_SUBJECT_REQS
} from '@/types/school'

/** 数据源候选（按顺序尝试） */
const SOURCE_CANDIDATES = [
  '/data/schools.csv',
  '/data/schools.md',
  '/data/schools.json',
  '/data/schools.xlsx',
  '/data/schools.xls'
]

const cache = new Map<string, Promise<ISchool[]>>()

/** 列表头别名映射（各种写法 → 标准字段） */
const HEADER_ALIAS: Record<string, keyof ISchool | '院校特色' | '选科要求'> = {
  标识码: '学校标识码',
  学校标识码: '学校标识码',
  代码: '学校标识码',
  院校代码: '学校标识码',
  名称: '学校名称',
  学校名称: '学校名称',
  院校名称: '学校名称',
  院校: '学校名称',
  学校: '学校名称',
  投档分数: '投档分数',
  投档分: '投档分数',
  投档线: '投档分数',
  最低位次: '最低位次',
  位次: '最低位次',
  省份: '省份',
  所属省份: '省份',
  城市: '城市',
  所在地: '城市',
  所在城市: '城市',
  办学层次: '院校层次',
  院校层次: '院校层次',
  层次: '院校层次',
  院校性质: '院校性质',
  性质: '院校性质',
  办学性质: '院校性质',
  特色: '院校特色',
  院校特色: '院校特色',
  标签: '院校特色',
  招生类型: '招生类型',
  类型: '招生类型',
  选科: '选科要求',
  选科类型: '选科要求',
  选科要求: '选科要求',
  选课类型: '选科要求',
  选课要求: '选科要求',
  主管部门: '主管部门'
}

/** Cached promise 防止并发重复加载 */
let cachedLoad: Promise<ISchool[]> | null = null
let cachedSource: string | null = null

export function loadSchools(): Promise<ISchool[]> {
  if (cachedLoad) return cachedLoad
  cachedLoad = doLoad()
  return cachedLoad
}

/** 暴露当前已选定的数据源（用于在 UI 上提示用户） */
export function getLoadedSource(): string {
  return cachedSource || ''
}

async function doLoad(): Promise<ISchool[]> {
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  for (const rel of SOURCE_CANDIDATES) {
    const url = baseUrl + rel
    try {
      const resp = await fetch(url)
      if (!resp.ok) continue
      const text = await resp.text()
      let list: ISchool[]
      if (rel.endsWith('.json')) {
        list = parseJSON(text)
      } else if (rel.endsWith('.csv')) {
        list = parseCSV(text)
      } else if (rel.endsWith('.md')) {
        list = parseMarkdownTable(text)
      } else {
        // xlsx/xls
        const buf = new Uint8Array(await resp.arrayBuffer())
        list = parseXLSX(buf)
      }
      cachedSource = rel
      console.info(`[school] loaded ${list.length} rows from ${url}`)
      return list
    } catch (e) {
      console.warn(`[school] failed to load ${url}:`, e)
      continue
    }
  }
  throw new Error(
    '未找到院校数据文件。\n请将以下任一格式放到 public/data/ 目录：\n' +
      SOURCE_CANDIDATES.map((p) => '  • ' + p).join('\n')
  )
}

/* ============================================================
 * 解析器
 * ============================================================ */

/** JSON 直接解析（约定为 ISchool[]） */
export function parseJSON(text: string): ISchool[] {
  const data = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('JSON 根节点必须是数组')
  return data.map(normalizeRow)
}

/** CSV 解析（支持引号转义、双引号转义双引号） */
export function parseCSV(text: string): ISchool[] {
  const lines = splitCSVLines(text)
  if (lines.length === 0) return []
  const headers = parseCSVLine(lines[0]).map((h) => normalizeHeader(h))
  const rows: ISchool[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cells = parseCSVLine(lines[i])
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      if (h) obj[h] = cells[idx] || ''
    })
    const rec = mapRowObject(obj)
    if (rec) rows.push(rec)
  }
  return rows
}

/** Markdown 表格解析 */
export function parseMarkdownTable(text: string): ISchool[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'))
  if (lines.length < 2) return []
  const headers = parseMarkdownCells(lines[0]).map(normalizeHeader)
  // 第二行通常是分隔符 `|---|---|` 跳过
  const dataLines = lines.slice(2)
  const rows: ISchool[] = []
  for (const line of dataLines) {
    const cells = parseMarkdownCells(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      if (h) obj[h] = cells[idx] || ''
    })
    const rec = mapRowObject(obj)
    if (rec) rows.push(rec)
  }
  return rows
}

/** XLSX/XLS 解析 */
export function parseXLSX(buf: ArrayBuffer | Uint8Array): ISchool[] {
  const data = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  const wb = XLSX.read(data, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return []
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: true })
  return parseAOA(aoa)
}

/** 把二维数组按表头解析（沿用旧的 Excel 解析规则，兼容"XX省（XX所）"分组行） */
export function parseAOA(aoa: unknown[][]): ISchool[] {
  if (aoa.length === 0) return []
  const headerRow = (aoa[0] || []).map((c) => normalizeHeader(String(c || '').trim()))
  const result: ISchool[] = []
  let currentProvince = ''
  for (let i = 1; i < aoa.length; i++) {
    const row = (aoa[i] || []).map((c) => (c == null ? '' : String(c).trim()))
    if (row.length === 0) continue
    const firstCell = row[0] || ''

    // 省份分组行
    if (/[（(]\d+所[)）]/.test(firstCell)) {
      currentProvince = firstCell.replace(/[（(]\d+所[)）].*$/, '').trim()
      continue
    }

    const obj: Record<string, string> = {}
    headerRow.forEach((h, idx) => {
      if (h) obj[h] = row[idx] || ''
    })
    if (!obj.省份 && currentProvince) obj.省份 = currentProvince
    const rec = mapRowObject(obj)
    if (rec) result.push(rec)
  }
  return result
}

/* ============================================================
 * 行归一化
 * ============================================================ */

function normalizeHeader(h: string): string {
  const k = h.trim()
  return (HEADER_ALIAS[k] as string) || k
}

function mapRowObject(obj: Record<string, string>): ISchool | null {
  const name = (obj.学校名称 || '').trim()
  if (!name) return null
  return normalizeRow({
    学校标识码: (obj.学校标识码 || '').trim(),
    学校名称: name,
    投档分数: obj.投档分数 || '',
    最低位次: obj.最低位次 || '',
    省份: (obj.省份 || '').trim(),
    城市: (obj.城市 || '').trim(),
    院校层次: (obj.院校层次 || '').trim(),
    院校性质: (obj.院校性质 || '').trim(),
    院校特色: (obj.院校特色 || '').trim(),
    招生类型: (obj.招生类型 || '').trim(),
    选科要求: (obj.选科要求 || '').trim(),
    主管部门: (obj.主管部门 || '').trim()
  })
}

/** 把字符串字段转成强类型 ISchool */
function normalizeRow(input: any): ISchool {
  const features = String(input.院校特色 || '')
    .split(/[|,，;；]/)
    .map((s) => s.trim())
    .filter((s) => ALL_FEATURES.includes(s as ISchoolFeature)) as ISchoolFeature[]
  const nature = ALL_NATURES.includes(input.院校性质) ? input.院校性质 : '公办'
  const level = ALL_LEVELS.includes(input.院校层次) ? input.院校层次 : '本科'
  const admission = ALL_ADMISSION_TYPES.includes(input.招生类型) ? input.招生类型 : '普通类'
  const subject = ALL_SUBJECT_REQS.includes(input.选科要求) ? input.选科要求 : '不限'
  return {
    学校标识码: String(input.学校标识码 || '').trim(),
    学校名称: String(input.学校名称 || '').trim(),
    投档分数: toNumber(input.投档分数),
    最低位次: toNumber(input.最低位次),
    省份: String(input.省份 || '').trim(),
    城市: String(input.城市 || '').trim(),
    院校层次: level as ISchoolLevel,
    院校性质: nature as ISchoolNature,
    院校特色: features,
    招生类型: admission as IAdmissionType,
    选科要求: subject as ISubjectReq,
    主管部门: String(input.主管部门 || '').trim()
  }
}

function toNumber(v: unknown): number {
  if (v == null || v === '') return 0
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/* ============================================================
 * CSV / Markdown 工具
 * ============================================================ */

function splitCSVLines(text: string): string[] {
  const lines: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuote && text[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuote = !inQuote
      }
      cur += ch
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (cur) lines.push(cur)
      cur = ''
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else {
      cur += ch
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === ',' && !inQuote) {
      cells.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur)
  return cells.map((c) => c.trim())
}

function parseMarkdownCells(line: string): string[] {
  // 去掉首尾 |
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/* ============================================================
 * 派生下拉项
 * ============================================================ */

const PROVINCES = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区',
  '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'
]

export function deriveProvinces(list: ISchool[]): string[] {
  const set = new Set<string>()
  list.forEach((s) => s.省份 && set.add(s.省份))
  if (set.size === 0) {
    list.forEach((s) => {
      const prov = PROVINCES.find((p) => s.城市.startsWith(p))
      if (prov) set.add(prov)
    })
  }
  return Array.from(set).sort((a, b) => {
    return PROVINCES.indexOf(a) - PROVINCES.indexOf(b)
  })
}

export function deriveCities(list: ISchool[], province: string): string[] {
  const set = new Set<string>()
  list.forEach((s) => {
    if (!province || s.省份 === province) {
      if (s.城市) set.add(s.城市)
    }
  })
  return Array.from(set).sort()
}

export function deriveSubjects(list: ISchool[]): ISubjectReq[] {
  const set = new Set<ISubjectReq>()
  list.forEach((s) => set.add(s.选科要求))
  return ALL_SUBJECT_REQS.filter((v) => set.has(v))
}
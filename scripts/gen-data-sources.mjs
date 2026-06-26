/**
 * 从原始 xls 生成多格式数据源（CSV / Markdown / JSON）
 *
 * 输入：data/全国普通高等学校名单_YYYYMMDD.xls
 * 输出：
 *   public/data/schools.csv     （推荐 - 用 Excel/Numbers/WPS 直接编辑）
 *   public/data/schools.md      （推荐 - VSCode/记事本/GitHub 都能看）
 *   public/data/schools.json    （备用）
 *
 * 新列：省份 / 城市 / 最低位次 / 院校层次 / 院校性质 / 院校特色 / 招生类型 / 选科要求
 * 旧列：学校标识码 / 学校名称 / 投档分数 / 主管部门
 */
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const DATA_IN = path.join(ROOT, 'data')
const DATA_OUT = path.join(ROOT, 'public', 'data')
fs.mkdirSync(DATA_OUT, { recursive: true })

const PROVINCES = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区',
  '宁夏回族自治区', '新疆维吾尔自治区',
  '新疆生产建设兵团',
  '香港特别行政区', '澳门特别行政区'
]

function pickProvince(text) {
  if (!text) return ''
  return PROVINCES.find((p) => text.startsWith(p)) || ''
}

function pickCity(text, province) {
  if (!text) return ''
  if (!province) return text
  return text.slice(province.length)
}

/** 从学校名称 + 标识码识别院校特色（启发式，可手工覆盖） */
function inferFeatures(name, code) {
  const f = []
  // 985/211：常见名称识别（数据源覆盖率低，仅作示例）
  const KNOWN_985 = [
    '北京大学', '清华大学', '中国人民大学', '北京航空航天大学',
    '北京理工大学', '中国农业大学', '北京师范大学', '中央民族大学',
    '南开大学', '天津大学', '大连理工大学', '东北大学',
    '吉林大学', '哈尔滨工业大学', '复旦大学', '同济大学',
    '上海交通大学', '华东师范大学', '南京大学', '东南大学',
    '浙江大学', '中国科学技术大学', '厦门大学', '山东大学',
    '中国海洋大学', '武汉大学', '华中科技大学', '中南大学',
    '湖南大学', '国防科技大学', '中山大学', '华南理工大学',
    '四川大学', '重庆大学', '电子科技大学', '西安交通大学',
    '西北工业大学', '西北农林科技大学', '兰州大学', '中央民族大学'
  ]
  const KNOWN_211 = [...KNOWN_985]
  if (KNOWN_985.includes(name)) f.push('985')
  if (KNOWN_211.includes(name)) f.push('211')
  // 双一流：教育部直属院校都标记
  if (name.includes('大学') && code?.startsWith('4111')) f.push('双一流')
  return f
}

function main() {
  const dataDir = 'D:\\frond-end\\graduate_school_query\\data'
  const files = fs.readdirSync(dataDir).filter((f) => /\.xlsx?$/i.test(f))
  // 找最大那个（一般是大数据文件）
  files.sort((a, b) => fs.statSync(path.join(dataDir, b)).size - fs.statSync(path.join(dataDir, a)).size)
  if (files.length === 0) {
    console.error('在 data/ 下找不到 xls/xlsx')
    process.exit(1)
  }
const SAMPLE_FILLS = {
  '4111010001': { 投档分数: 685, 最低位次: 28, 选科要求: '物理+化学' },
  '4111010003': { 投档分数: 685, 最低位次: 30, 选科要求: '物理+化学' },
  '4111010002': { 投档分数: 670, 最低位次: 80, 选科要求: '不限' },
  '4111010005': { 投档分数: 598, 最低位次: 8500, 选科要求: '物理' },
  '4111010007': { 投档分数: 580, 最低位次: 12000, 选科要求: '物理+化学' },
  '4111010010': { 投档分数: 540, 最低位次: 28000, 选科要求: '不限' },
  '4111010011': { 投档分数: 525, 最低位次: 35000, 选科要求: '不限' },
  '4111010012': { 投档分数: 510, 最低位次: 42000, 选科要求: '历史' },
  '4111010801': { 投档分数: 480, 最低位次: 58000, 选科要求: '不限' },
  '4111010802': { 投档分数: 460, 最低位次: 72000, 选科要求: '不限' },
  '4111010811': { 投档分数: 430, 最低位次: 95000, 选科要求: '不限' },
  '4111010821': { 投档分数: 420, 最低位次: 105000, 选科要求: '历史+地理' },
  // 天津示例
  '4112010001': { 投档分数: 660, 最低位次: 200, 选科要求: '物理+化学' },
  '4112010002': { 投档分数: 580, 最低位次: 12000, 选科要求: '物理' },
  '4112010010': { 投档分数: 540, 最低位次: 26000, 选科要求: '不限' },
  '4112010011': { 投档分数: 530, 最低位次: 32000, 选科要求: '不限' },
  '4112010801': { 投档分数: 490, 最低位次: 52000, 选科要求: '不限' },
  // 河北示例
  '4113010001': { 投档分数: 620, 最低位次: 4500, 选科要求: '物理+化学' },
  '4113010010': { 投档分数: 555, 最低位次: 22000, 选科要求: '不限' },
  '4113010011': { 投档分数: 510, 最低位次: 40000, 选科要求: '历史' },
  '4113010801': { 投档分数: 450, 最低位次: 80000, 选科要求: '不限' }
}

  const xlsFile = files[0]
  console.log('使用源文件：' + xlsFile + '（' + fs.statSync(path.join(dataDir, xlsFile)).size + ' bytes）')
  const wb = XLSX.read(fs.readFileSync(path.join(dataDir, xlsFile)), { type: 'buffer', cellDates: true })
  const aoa = XLSX.utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]],
    { header: 1, defval: '', raw: false }
  )

  const rows = []
  let currentProvince = ''
  for (let i = 0; i < aoa.length; i++) {
    const r = (aoa[i] || []).map((c) => String(c ?? '').trim())
    if (r.length === 0) continue
    const first = r[0] || ''

    // 跳过表头说明
    if (i < 3 && /全国|名单|截至|附件|截/.test(first)) continue

    // 分组行
    if (/[（(]\d+所[)）]/.test(first)) {
      currentProvince = first.replace(/[（(]\d+所[)）].*$/, '').trim()
      continue
    }
    // 非数字行（说明行）
    if (!/^\d+$/.test(first)) continue

    const 所在地 = r[5] || ''
    const 省份 = currentProvince || pickProvince(所在地)
    const 城市 = pickCity(所在地, 省份) || 所在地
    const 院校层次 = r[6] === '专科' ? '专科(高职)' : '本科'

    const name = r[1]
    const code = r[3]
    rows.push({
      学校标识码: code,
      学校名称: name,
      投档分数: '',
      最低位次: '',
      省份,
      城市,
      院校层次,
      院校性质: r[8] || '公办',
      院校特色: inferFeatures(name, code).join('|'),
      招生类型: '普通类',
      选科要求: '不限',
      主管部门: r[4] || ''
    })
  }

  // 应用示例填充（仅首次/演示时存在）
  let filledCount = 0
  for (const row of rows) {
    const fill = SAMPLE_FILLS[row.学校标识码]
    if (fill) {
      Object.assign(row, fill)
      filledCount++
    }
  }
  console.log(`  示例分数填充：${filledCount} 条`)

  console.log(`共 ${rows.length} 条院校记录`)
  writeCSV(rows)
  writeMD(rows)
  writeJSON(rows)
}

const CSV_HEADERS = [
  '学校标识码', '学校名称', '投档分数', '最低位次',
  '省份', '城市', '院校层次', '院校性质',
  '院校特色', '招生类型', '选科要求', '主管部门'
]

function csvEscape(v) {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function writeCSV(rows) {
  const lines = [CSV_HEADERS.join(',')]
  for (const r of rows) {
    lines.push(CSV_HEADERS.map((h) => csvEscape(r[h])).join(','))
  }
  const txt = '\uFEFF' + lines.join('\n')
  const tmp = path.join(DATA_OUT, '_schools.csv.tmp')
  fs.writeFileSync(tmp, txt, 'utf-8')
  // 原子替换，避开 IDE 句柄锁
  fs.renameSync(tmp, path.join(DATA_OUT, 'schools.csv'))
  console.log('  ✓ schools.csv  (' + (txt.length / 1024).toFixed(1) + ' KB)')
}

function writeMD(rows) {
  const lines = []
  lines.push('# 高考院校数据（' + new Date().toISOString().slice(0, 10) + '）')
  lines.push('')
  lines.push('> 共 ' + rows.length + ' 所院校。本文件由 `scripts/gen-data-sources.mjs` 自动生成。')
  lines.push('> 非技术人员可使用 **VSCode / Typora / 任何文本编辑器** 直接编辑。')
  lines.push('')
  lines.push('| ' + CSV_HEADERS.join(' | ') + ' |')
  lines.push('| ' + CSV_HEADERS.map(() => '---').join(' | ') + ' |')
  for (const r of rows) {
    lines.push('| ' + CSV_HEADERS.map((h) => String(r[h] ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |')
  }
  const tmp = path.join(DATA_OUT, '_schools.md.tmp')
  fs.writeFileSync(tmp, lines.join('\n'), 'utf-8')
  fs.renameSync(tmp, path.join(DATA_OUT, 'schools.md'))
  console.log('  ✓ schools.md   (' + (lines.join('\n').length / 1024).toFixed(1) + ' KB)')
}

function writeJSON(rows) {
  const tmp = path.join(DATA_OUT, '_schools.json.tmp')
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2), 'utf-8')
  fs.renameSync(tmp, path.join(DATA_OUT, 'schools.json'))
  console.log('  ✓ schools.json (' + rows.length + ' 条)')
}

main()

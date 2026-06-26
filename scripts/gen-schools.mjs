/**
 * 院校数据生成脚本（mock）
 * 模拟全国普通高等学校招生数据，覆盖 31 个省份 + 文科 / 理科 / 物理 / 历史
 * 数据字段与用户提供的 Excel 表头对齐：
 *   序号、学校名称、投档分数、学校标识码、所在地城市、办学层次、选课类型、院校性质
 */
import { writeFileSync } from 'node:fs'

// 31 个省级行政区
const provinces = [
  '北京', '天津', '上海', '重庆',
  '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海',
  '内蒙古', '广西', '西藏', '宁夏', '新疆'
]

// 31 个省份对应的"热门城市"（用于所在地城市字段）
const cityMap = {
  北京: '北京', 天津: '天津', 上海: '上海', 重庆: '重庆',
  河北: '石家庄', 山西: '太原', 辽宁: '沈阳', 吉林: '长春', 黑龙江: '哈尔滨',
  江苏: '南京', 浙江: '杭州', 安徽: '合肥', 福建: '福州', 江西: '南昌', 山东: '济南',
  河南: '郑州', 湖北: '武汉', 湖南: '长沙', 广东: '广州', 海南: '海口',
  四川: '成都', 贵州: '贵阳', 云南: '昆明', 陕西: '西安', 甘肃: '兰州', 青海: '西宁',
  内蒙古: '呼和浩特', 广西: '南宁', 西藏: '拉萨', 宁夏: '银川', 新疆: '乌鲁木齐'
}

// 真实院校命名种子（前缀 + 地理/学科后缀）
const prefixList = [
  '华北电力', '东北师范', '华东理工', '华南农业', '西南交通', '西北工业', '中国矿业',
  '北京工业', '上海海洋', '江苏大学', '浙江工业', '安徽理工', '福建师范', '江西农业',
  '山东理工', '河南工业', '武汉理工', '湖南师范', '广东工业', '海南大学', '四川师范',
  '贵州大学', '云南师范', '西安建筑', '兰州交通', '青海师范', '内蒙古农业', '广西师范',
  '宁夏大学', '新疆师范', '河北工业', '山西大学', '辽宁石油', '吉林农业', '哈尔滨理工',
  '中央财经', '对外经济', '北京语言', '中国政法', '首都师范', '首都经贸', '北京建筑',
  '上海财经', '上海对外', '上海理工', '上海师范', '华东政法', '上海海事',
  '南京财经', '南京审计', '南京信息', '苏州大学', '扬州大学',
  '杭州电子', '浙江财经', '宁波大学', '温州医科',
  '合肥工业', '安徽大学', '安徽医科',
  '福州大学', '华侨大学', '集美大学',
  '南昌大学', '江西财经', '华东交通',
  '山东大学', '青岛大学', '山东财经',
  '郑州大学', '河南财经', '河南师范',
  '武汉大学', '华中科技', '中南财经', '湖北大学',
  '湖南大学', '中南大学', '湘潭大学',
  '中山大学', '暨南大学', '华南理工', '深圳大学', '广东外语',
  '四川大学', '电子科技', '西南财经',
  '云南大学', '昆明理工',
  '西安交通', '西安电子', '陕西师范',
  '兰州大学', '西北师范',
  '广西大学', '桂林电子',
  '中国石油', '中国地质', '中国海洋', '中国药科',
  '北京林业', '北京工商', '北京信息', '北京联合',
  '首都医科', '北京电子', '北京印刷',
  '上海工程', '上海第二', '上海应用', '上海电力',
  '南京医科', '南京林业', '南京工业', '南京中医药',
  '浙江理工', '浙江工商', '中国计量',
  '青岛理工', '山东建筑', '山东农业',
  '河南大学', '河南科技', '河南中医',
  '湖北工业', '武汉工程', '武汉纺织',
  '湖南科技', '长沙理工', '南华大学',
  '广东海洋', '广东药科', '广州大学', '五邑大学',
  '四川农业', '成都理工', '西华大学',
  '贵州师范', '贵州财经',
  '西安理工', '西安工业', '西安石油',
  '兰州理工', '兰州交通',
  '新疆大学', '石河子大学'
]

// 办学层次
const levels = ['本科', '本科', '本科', '专科']

// 院校性质
const natures = ['公办', '民办', '中外合作']

// 选课类型（新高考 3+1+2 模式）：物理 / 历史 + (化学, 生物, 地理, 政治) 组合
const subjects = ['物理', '历史', '化学', '生物', '地理', '政治']

// 分数段分布：以 400-650 为主，覆盖本科批到重点线
function genScore(province, level) {
  const base = {
    本科: 420,
    专科: 280
  }[level] || 400

  // 不同省份的"卷难度系数"（简单模拟）
  const difficulty = {
    北京: 30, 天津: 25, 上海: 35, 浙江: 30, 江苏: 35,
    海南: 25, 福建: 15, 广东: 15, 山东: 20, 河北: 10,
    其他: 0
  }[province] ?? 0

  // 在基础分上加随机波动
  const noise = Math.floor(Math.random() * 200) - 50
  return Math.max(200, Math.min(680, base + difficulty + noise))
}

// 简单字符串 hash → 用于生成稳定的"学校标识码"
function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString().padStart(5, '0').slice(0, 5)
}

function pickSubjects() {
  // 80% 单科，20% 组合
  if (Math.random() < 0.8) return [subjects[Math.floor(Math.random() * 2)]]
  const n = 2 + Math.floor(Math.random() * 2)
  const pool = [...subjects].sort(() => Math.random() - 0.5)
  return pool.slice(0, n)
}

// 文理 / 物理历史兼容别名
function compatSubject(subjects) {
  const s = subjects.join('+')
  if (s.includes('物理')) return ['物理', '物理+化学', '物理+生物', '物理+地理', '物理+政治', '物理+化学+生物']
  if (s.includes('历史')) return ['历史', '历史+地理', '历史+政治', '历史+化学', '历史+生物']
  return ['物理', '历史']
}

const rows = []
let id = 1

for (const province of provinces) {
  // 每个省份生成 30-50 条
  const count = 30 + Math.floor(Math.random() * 20)
  const usedNames = new Set()

  for (let i = 0; i < count; i++) {
    let name
    // 命名规则：省份 + 院校前缀 + 城市
    const isLocal = Math.random() < 0.6 // 60% 本省院校
    let prefix
    if (isLocal) {
      // 本省的院校：选名字含本省省份前缀的
      prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
    } else {
      // 外省：随机
      prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
    }

    // 组合唯一名字
    const suffixes = ['大学', '学院']
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    let fullName
    let attempts = 0
    do {
      fullName = `${prefix}${suffix}`
      attempts++
      if (attempts > 10) break
    } while (usedNames.has(fullName))
    usedNames.add(fullName)

    const level = levels[Math.floor(Math.random() * levels.length)]
    const nature = natures[Math.floor(Math.random() * natures.length)]
    const subs = pickSubjects()
    const score = genScore(province, level)
    const code = hashCode(fullName)

    rows.push({
      序号: id++,
      学校名称: fullName,
      投档分数: score,
      学校标识码: code,
      所在地城市: cityMap[province],
      办学层次: level,
      选课类型: subs.join('+'),
      院校性质: nature,
      省份: province,
      // 内置兼容字段：文科/理科 也归并到科目里
      兼容科目: compatSubject(subs)
    })
  }
}

// 排序：先省份，后投档分数降序
rows.sort((a, b) => {
  if (a.省份 !== b.省份) return a.省份.localeCompare(b.省份, 'zh-CN')
  return b.投档分数 - a.投档分数
})

// 重新编号
rows.forEach((r, i) => (r.序号 = i + 1))

// 输出 JSON（写到 src/data/schools.json）
const out = `// 自动生成院校数据（mock）
// 字段与 Excel 表头对齐：序号、学校名称、投档分数、学校标识码、所在地城市、办学层次、选课类型、院校性质
// 兼容科目字段用于匹配"文/理/物理/历史"等查询条件
export interface ISchool {
  序号: number
  学校名称: string
  投档分数: number
  学校标识码: string
  所在地城市: string
  办学层次: string
  选课类型: string
  院校性质: string
  省份: string
  兼容科目: string[]
}

export const schools: ISchool[] = ${JSON.stringify(rows, null, 2)}
`

writeFileSync(new URL('../src/data/schools.ts', import.meta.url), out, 'utf-8')
console.log(`已生成 ${rows.length} 条院校数据`)
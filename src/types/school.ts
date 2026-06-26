/** 院校数据模型（与 Excel/CSV/Markdown 表头对应） */

/** 院校性质枚举 */
export type ISchoolNature = '公办' | '民办' | '中外合作办学' | '内地与港澳台地区合作办学'

/** 院校特色（可多选） */
export type ISchoolFeature =
  | '985'
  | '211'
  | '双一流'
  | '教育部直属'
  | '中央部署'
  | '强基计划'
  | '研究生院'

/** 院校层次 */
export type ISchoolLevel = '本科' | '专科(高职)'

/** 招生类型 */
export type IAdmissionType = '普通类' | '中外合作办学' | '校企合作' | '艺术类' | '体育类'

/** 选科要求 */
export type ISubjectReq =
  | '物理'
  | '历史'
  | '物理+化学'
  | '物理+化学+生物'
  | '物理+地理'
  | '历史+地理'
  | '历史+政治'
  | '不限'

export interface ISchool {
  /** 学校标识码 */
  学校标识码: string
  /** 学校名称 */
  学校名称: string
  /** 院校隶属省份（用于"省份"下拉） */
  省份: string
  /** 院校所在城市（用于"城市"二级下拉） */
  城市: string
  /** 投档分数 */
  投档分数: number
  /** 投档最低位次 */
  最低位次: number
  /** 院校层次：本科/专科(高职) */
  院校层次: ISchoolLevel
  /** 院校性质 */
  院校性质: ISchoolNature
  /** 院校特色（多值以 | 分隔） */
  院校特色: ISchoolFeature[]
  /** 招生类型 */
  招生类型: IAdmissionType
  /** 选科要求 */
  选科要求: ISubjectReq
  /** 主管部门 */
  主管部门?: string
}

/** 报考概率阈值（基于分数差） */
export const PROBABILITY_THRESHOLDS = [
  { value: 'high', label: '概率大', min: -Infinity, max: -20, color: 'success' as const },
  { value: 'mid', label: '概率中', min: -20, max: 20, color: 'primary' as const },
  { value: 'low', label: '概率小', min: 20, max: Infinity, color: 'danger' as const }
]

/** 院校特色枚举列表（用于表头校验） */
export const ALL_FEATURES: ISchoolFeature[] = [
  '985', '211', '双一流', '教育部直属', '中央部署', '强基计划', '研究生院'
]

/** 院校性质枚举列表 */
export const ALL_NATURES: ISchoolNature[] = [
  '公办', '民办', '中外合作办学', '内地与港澳台地区合作办学'
]

/** 院校层次列表 */
export const ALL_LEVELS: ISchoolLevel[] = ['本科', '专科(高职)']

/** 招生类型列表 */
export const ALL_ADMISSION_TYPES: IAdmissionType[] = [
  '普通类', '中外合作办学', '校企合作', '艺术类', '体育类'
]

/** 选科要求列表 */
export const ALL_SUBJECT_REQS: ISubjectReq[] = [
  '不限', '物理', '历史', '物理+化学', '物理+化学+生物', '物理+地理', '历史+地理', '历史+政治'
]
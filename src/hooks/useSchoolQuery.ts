/**
 * 高考志愿查询 - 核心 hook
 *
 * 数据来源：fetch /data/schools.{csv|md|json|xlsx|xls}（运行时读取）
 */
import { ref, computed, watch } from 'vue'
import type { ISchool, ISchoolFeature, ISchoolNature, ISchoolLevel, IAdmissionType } from '@/types/school'
import {
  loadSchools,
  getLoadedSource,
  deriveProvinces,
  deriveCities,
  deriveSubjects
} from '@/utils/excelLoader'

export type { ISchool } from '@/types/school'
export type { ISchoolFeature, ISchoolLevel, ISchoolNature, IAdmissionType, ISubjectReq } from '@/types/school'

/** 分组结果 */
export interface IGroupResult {
  key: 'chong' | 'wen' | 'bao'
  title: string
  desc: string
  tone: 'danger' | 'primary' | 'success'
  list: ISchool[]
}

/** 院校特色选项 */
export type FeatureFilter = ISchoolFeature | 'all'

/** 报考概率 */
export type ProbabilityFilter = 'high' | 'mid' | 'low' | 'all'

/** 表单 */
export interface IQueryForm {
  /** 院校所在省份 */
  province: string
  /** 院校所在城市（依赖 province） */
  city: string
  /** 院校层次 */
  level: ISchoolLevel | 'all'
  /** 院校性质 */
  nature: ISchoolNature | 'all'
  /** 院校特色（多选） */
  features: FeatureFilter[]
  /** 招生类型 */
  admission: IAdmissionType | 'all'
  /** 选科要求 */
  subject: string
  /** 高考分数 */
  score: number | null
  /** 当前用户所在省份（用于划分省内/省外） */
  userProvince: string
  /** 每组最多展示数（默认 3） */
  limit: number
}

const DEFAULT_FORM: IQueryForm = {
  province: '',
  city: '',
  level: 'all',
  nature: 'all',
  features: [],
  admission: 'all',
  subject: '',
  score: null,
  userProvince: '',
  limit: 3
}

/** 全局单例 */
const allSchools = ref<ISchool[]>([])
const loaded = ref(false)
const loading = ref(false)
const loadError = ref<string>('')
const source = ref('')

async function ensureLoaded() {
  if (loaded.value) return
  loading.value = true
  loadError.value = ''
  try {
    allSchools.value = await loadSchools()
    source.value = getLoadedSource()
    loaded.value = true
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

export function useSchoolQuery() {
  const form = ref<IQueryForm>({ ...DEFAULT_FORM })
  const submitted = ref(false)

  const provinceOptions = computed(() =>
    [{ label: '全部', value: '' }, ...deriveProvinces(allSchools.value).map((v) => ({ label: v, value: v }))]
  )

  /** 用户所在省份下拉（默认全国，按拼音排序） */
  const userProvinceOptions = computed(() => [
    { label: '不区分（仅一列）', value: '' },
    ...deriveProvinces(allSchools.value).map((v) => ({ label: v, value: v }))
  ])

  const cityOptions = computed(() => {
    const cities = deriveCities(allSchools.value, form.value.province)
    return [{ label: '全部', value: '' }, ...cities.map((v) => ({ label: v, value: v }))]
  })

  const subjectOptions = computed(() => {
    const subjects = deriveSubjects(allSchools.value)
    return [{ label: '全部', value: '' }, ...subjects.map((v) => ({ label: v, value: v }))]
  })

  /** 当省份变化时清空城市 */
  watch(() => form.value.province, () => {
    form.value.city = ''
  })

  /** 过滤后的院校列表 */
  const filtered = computed<ISchool[]>(() => {
    if (!submitted.value) return []
    const f = form.value
    const score = f.score ?? 0
    return allSchools.value
      .filter((s) => {
        if (f.province && s.省份 !== f.province) return false
        if (f.city && s.城市 !== f.city) return false
        if (f.level !== 'all' && s.院校层次 !== f.level) return false
        if (f.nature !== 'all' && s.院校性质 !== f.nature) return false
        if (f.admission !== 'all' && s.招生类型 !== f.admission) return false
        if (f.subject && s.选科要求 !== f.subject && s.选科要求 !== '不限') return false
        if (f.features.length > 0) {
          const has = f.features.every((feat) => s.院校特色.includes(feat as ISchoolFeature))
          if (!has) return false
        }
        return true
      })
      .filter((s) => s.投档分数 > 0)
      .sort((a, b) => a.投档分数 - b.投档分数)
  })

  /** 概率分组 + 省内/省外拆分 + limit 截取
   *  返回 3 档（冲/稳/保），每档包含 in（省内）/ out（省外）
   */
  const groupedBins = computed<{
    key: 'chong' | 'wen' | 'bao'
    title: string
    desc: string
    tone: IGroupResult['tone']
    in: ISchool[]
    out: ISchool[]
  }[]>(() => {
    const limit = Math.max(1, form.value.limit || 3)
    const userProv = form.value.userProvince || ''
    const inBin = { chong: [] as ISchool[], wen: [] as ISchool[], bao: [] as ISchool[] }
    const outBin = { chong: [] as ISchool[], wen: [] as ISchool[], bao: [] as ISchool[] }
    for (const s of filtered.value) {
      const diff = s.投档分数 - (form.value.score ?? 0)
      const bucket: 'chong' | 'wen' | 'bao' = diff > 20 ? 'chong' : diff >= -20 ? 'wen' : 'bao'
      const target = userProv && s.省份 === userProv ? inBin : outBin
      target[bucket].push(s)
    }
    const make = (key: 'chong' | 'wen' | 'bao', title: string, desc: string, tone: IGroupResult['tone']) => ({
      key,
      title,
      desc,
      tone,
      in: inBin[key].slice(0, limit),
      out: outBin[key].slice(0, limit)
    })
    return [
      make('chong', '冲一冲（概率小）', '投档分 > 你的分数 + 20', 'danger'),
      make('wen', '稳一稳（概率中）', '±20 分以内', 'primary'),
      make('bao', '保一保（概率大）', '投档分 < 你的分数 - 20', 'success')
    ]
  })

  /** 兼容旧 API（移动端单列模式用） */
  const groups = computed<IGroupResult[]>(() =>
    groupedBins.value.map((g) => ({
      key: g.key,
      title: g.title,
      desc: g.desc,
      tone: g.tone,
      // 单列模式：省内优先
      list: g.in.length > 0 ? g.in : g.out
    }))
  )

  /** 给 App.vue 用：双列布局时按"省内 / 省外"拆分（每档按 limit） */
  const groupedIn = computed(() => groupedBins.value.map((g) => ({ ...g, list: g.in })))
  const groupedOut = computed(() => groupedBins.value.map((g) => ({ ...g, list: g.out })))

  const totalMatch = computed(() => filtered.value.length)

  function submit() {
    submitted.value = true
  }

  function reset() {
    form.value = { ...DEFAULT_FORM }
    submitted.value = false
  }

  return {
    form,
    submitted,
    allSchools,
    loading,
    loadError,
    loaded,
    source,
    provinceOptions,
    userProvinceOptions,
    cityOptions,
    subjectOptions,
    filtered,
    groupedBins,
    groups,
    groupedIn,
    groupedOut,
    totalMatch,
    submit,
    reset,
    ensureLoaded
  }
}
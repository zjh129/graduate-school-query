<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  useSchoolQuery,
  type FeatureFilter
} from '@/hooks/useSchoolQuery'
import type { ISchoolFeature } from '@/types/school'
import {
  ALL_FEATURES,
  ALL_NATURES,
  ALL_LEVELS,
  ALL_ADMISSION_TYPES
} from '@/types/school'

const {
  form,
  submitted,
  groupedBins,
  totalMatch,
  loading,
  loadError,
  source,
  provinceOptions,
  userProvinceOptions,
  cityOptions,
  subjectOptions,
  submit,
  reset,
  ensureLoaded
} = useSchoolQuery()

ensureLoaded()

function toggleFeature(f: ISchoolFeature) {
  const arr = form.value.features as FeatureFilter[]
  const idx = arr.indexOf(f)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(f)
}

/** 按难度档位取数据（0=冲, 1=稳, 2=保） */
const g_in = (i: number) => groupedBins.value[i]?.in ?? []
const g_out = (i: number) => groupedBins.value[i]?.out ?? []
const g_all = (i: number) => [...g_in(i), ...g_out(i)]

const hasResult = computed(() => submitted.value)

const moreOpen = ref(false)

function onSubmit() {
  // 分数必填，其余均可空
  if (form.value.score == null || form.value.score <= 0) {
    ElMessage.warning('请输入高考分数')
    return
  }
  submit()
}

function handleReset() {
  reset()
  moreOpen.value = false
}

function diffText(score: number) {
  if (form.value.score == null) return '-'
  const diff = score - form.value.score
  return diff > 0 ? `+${diff}` : `${diff}`
}

</script>

<template>
  <div class="page">
    <!-- 数据加载/错误提示 -->
    <section v-if="loadError" class="alert">
      <div class="alert-title">数据加载失败</div>
      <div class="alert-msg">{{ loadError }}</div>
      <div class="alert-tip">
        请将院校数据文件（.csv / .md / .json / .xls / .xlsx）放入
        <b>public/data/</b> 目录后刷新
      </div>
    </section>

    <section v-else-if="loading" class="alert alert-info">
      <div class="alert-title">正在加载院校数据…</div>
    </section>

    <!-- 顶部品牌区 -->
    <header class="hero">
      <div class="hero-inner">
        <div class="hero-icon">🎓</div>
        <div class="hero-title">高考志愿填报助手</div>
        <div class="hero-sub">智能选大学 · 冲稳保一站搞定</div>
        <div v-if="source" class="hero-source">数据源：{{ source }}</div>
      </div>
    </header>

    <!-- 查询表单 -->
    <section class="form-card">
      <!-- 核心字段 -->
      <div class="form-core">
        <div class="fc-field">
          <label class="fc-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            高考分数
          </label>
          <el-input
            v-model.number="form.score"
            type="number"
            placeholder="输入分数"
            :min="0"
            :max="750"
            size="large"
          />
        </div>
        <div class="fc-field">
          <label class="fc-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            选科要求
          </label>
          <el-select v-model="form.subject" placeholder="全部" size="large" style="width: 100%">
            <el-option
              v-for="o in subjectOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
        <div class="fc-field">
          <label class="fc-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            您所在省份
          </label>
          <el-select
            v-model="form.userProvince"
            placeholder="不区分"
            size="large"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="o in userProvinceOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
        <el-button type="primary" size="large" class="fc-submit" @click="onSubmit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          智能匹配
        </el-button>
      </div>

      <!-- 更多筛选折叠区 -->
      <div class="form-more">
        <div class="fm-toggle" @click="moreOpen = !moreOpen">
          <span>更多筛选条件</span>
          <el-icon class="fm-arrow" :class="{ 'fm-arrow--up': moreOpen }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M7 10l5 5 5-5"/></svg>
          </el-icon>
        </div>
        <div v-show="moreOpen" class="fm-body">
          <div class="form-row">
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                所在地（省份）
              </label>
              <el-select v-model="form.province" placeholder="全部" style="width: 100%" filterable>
                <el-option v-for="o in provinceOptions" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </div>
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                所在地（城市）
              </label>
              <el-select v-model="form.city" placeholder="全部" style="width: 100%" filterable :disabled="!form.province">
                <el-option v-for="o in cityOptions" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                院校层次
              </label>
              <el-select v-model="form.level" placeholder="全部" style="width: 100%">
                <el-option label="全部" value="all" />
                <el-option v-for="v in ALL_LEVELS" :key="v" :label="v" :value="v" />
              </el-select>
            </div>
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                院校性质
              </label>
              <el-select v-model="form.nature" placeholder="全部" style="width: 100%">
                <el-option label="全部" value="all" />
                <el-option v-for="v in ALL_NATURES" :key="v" :label="v" :value="v" />
              </el-select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                招生类型
              </label>
              <el-select v-model="form.admission" placeholder="全部" style="width: 100%">
                <el-option label="全部" value="all" />
                <el-option v-for="v in ALL_ADMISSION_TYPES" :key="v" :label="v" :value="v" />
              </el-select>
            </div>
            <div class="form-cell">
              <label class="cell-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                每组最多展示
              </label>
              <el-input-number
                v-model="form.limit"
                :min="1"
                :max="20"
                controls-position="right"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="form-row form-row-tags">
            <label class="cell-label">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              院校特色
            </label>
            <div class="tag-list">
              <el-check-tag
                v-for="f in ALL_FEATURES"
                :key="f"
                :checked="form.features.includes(f)"
                @change="toggleFeature(f)"
              >{{ f }}</el-check-tag>
            </div>
          </div>
          <div class="fm-footer">
            <el-button round size="small" plain @click="handleReset">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
              重置
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 结果区 -->
    <section v-if="hasResult" class="result">
      <!-- 统计总览 -->
      <div class="result-stat">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        </div>
        <div class="stat-body">
          <div class="stat-num">{{ totalMatch }}</div>
          <div class="stat-label">匹配院校</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-cond">
          <span v-if="form.score" class="cond-item">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            分数 {{ form.score }}
          </span>
          <span v-if="form.userProvince" class="cond-item">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ form.userProvince }}
          </span>
          <span v-if="form.province" class="cond-item">{{ form.province }}</span>
          <span v-if="form.level !== 'all'" class="cond-item">{{ form.level }}</span>
          <span v-if="form.nature !== 'all'" class="cond-item">{{ form.nature }}</span>
          <span v-if="form.subject" class="cond-item">{{ form.subject }}</span>
          <span v-if="form.admission !== 'all'" class="cond-item">{{ form.admission }}</span>
          <span v-if="form.features.length" class="cond-item">{{ form.features.join(' · ') }}</span>
        </div>
      </div>

      <div v-if="totalMatch === 0" class="result-empty">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <div class="empty-title">未找到符合条件的院校</div>
        <div class="empty-tip">请调整分数或筛选条件后重试</div>
      </div>

      <!-- 分组结果 -->
      <div v-else class="result-groups">

        <!-- 冲一冲 -->
        <div class="rg-section">
          <div class="rg-header">
            <div class="rg-bar rg-bar--danger" />
            <span class="rg-title rg-title--danger">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              冲一冲
            </span>
            <span class="rg-desc">投档分 &gt; 分数 +20</span>
            <span class="rg-count rg-count--danger">
              {{ form.userProvince ? g_in(0).length + g_out(0).length : g_all(0).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(0).length + g_out(0).length : g_all(0).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(0)" :key="'in-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(0)" :key="'out-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(0)" :key="idx" class="school-card">
                <div class="sc-score-col">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-unit">投档分</div>
                  <div class="sc-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                  <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                </div>
                <div class="sc-main">
                  <div class="sc-name">{{ s.学校名称 }}</div>
                  <div class="sc-location">
                    <span class="sc-province">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ s.省份 }} · {{ s.城市 }}
                    </span>
                  </div>
                  <div class="sc-tags">
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                    <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                    <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                  </div>
                  <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">暂无院校</div>
          </div>
        </div>

        <!-- 稳一稳 -->
        <div class="rg-section">
          <div class="rg-header">
            <div class="rg-bar rg-bar--primary" />
            <span class="rg-title rg-title--primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              稳一稳
            </span>
            <span class="rg-desc">±20 分以内</span>
            <span class="rg-count rg-count--primary">
              {{ form.userProvince ? g_in(1).length + g_out(1).length : g_all(1).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(1).length + g_out(1).length : g_all(1).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(1)" :key="'in-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(1)" :key="'out-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(1)" :key="idx" class="school-card">
                <div class="sc-score-col">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-unit">投档分</div>
                  <div class="sc-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                  <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                </div>
                <div class="sc-main">
                  <div class="sc-name">{{ s.学校名称 }}</div>
                  <div class="sc-location">
                    <span class="sc-province">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ s.省份 }} · {{ s.城市 }}
                    </span>
                  </div>
                  <div class="sc-tags">
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                    <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                    <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                  </div>
                  <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">暂无院校</div>
          </div>
        </div>

        <!-- 保一保 -->
        <div class="rg-section">
          <div class="rg-header">
            <div class="rg-bar rg-bar--success" />
            <span class="rg-title rg-title--success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              保一保
            </span>
            <span class="rg-desc">投档分 &lt; 分数 -20</span>
            <span class="rg-count rg-count--success">
              {{ form.userProvince ? g_in(2).length + g_out(2).length : g_all(2).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(2).length + g_out(2).length : g_all(2).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(2)" :key="'in-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(2)" :key="'out-' + idx" class="school-card">
                  <div class="sc-score-col">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-unit">投档分</div>
                    <div class="sc-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                    <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                  </div>
                  <div class="sc-main">
                    <div class="sc-name">{{ s.学校名称 }}</div>
                    <div class="sc-location">
                      <span class="sc-province">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ s.省份 }} · {{ s.城市 }}
                      </span>
                      <span v-if="form.userProvince && s.省份 === form.userProvince" class="sc-tag sc-tag--in">省内</span>
                      <span v-else class="sc-tag sc-tag--out">省外</span>
                    </div>
                    <div class="sc-tags">
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                      <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                      <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                    </div>
                    <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(2)" :key="idx" class="school-card">
                <div class="sc-score-col">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-unit">投档分</div>
                  <div class="sc-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                  <div class="sc-rank">位次 {{ s.最低位次 || '-' }}</div>
                </div>
                <div class="sc-main">
                  <div class="sc-name">{{ s.学校名称 }}</div>
                  <div class="sc-location">
                    <span class="sc-province">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ s.省份 }} · {{ s.城市 }}
                    </span>
                  </div>
                  <div class="sc-tags">
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--level"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>{{ s.院校层次 }}</span>
                    <span v-if="s.院校性质" class="sc-tag sc-tag--nature"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>{{ s.院校性质 }}</span>
                    <span v-if="s.招生类型" class="sc-tag sc-tag--admit"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{{ s.招生类型 }}</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--feat"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>{{ f }}</span>
                  </div>
                  <div v-if="s.选科要求 && s.选科要求 !== '不限'" class="sc-subject"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>选科要求：{{ s.选科要求 }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">暂无院校</div>
          </div>
        </div>

      </div>
    </section>

    <!-- 空状态 -->
    <section v-else class="placeholder">
      <div class="ph-icon">🎓</div>
      <div class="ph-text">填写分数后开启智能推荐</div>
      <div class="ph-tip">
        所有筛选条件默认「全部」，可选填<br />
        基于投档分数 + 位次，匹配冲 / 稳 / 保 三档院校
      </div>
    </section>

    <footer class="footer">
      数据仅供参考 · 实际请以院校官方发布为准
    </footer>
  </div>
</template>

<style scoped lang="scss">
// ========== 全局 ==========
.page {
  min-height: 100vh;
  padding: 12px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f4f7ff;
}

// ========== Hero ==========
.hero {
  position: relative;
  background: linear-gradient(135deg, #1a3a8f 0%, #2b5be8 45%, #4f8fff 100%);
  color: #fff;
  padding: 18px 18px 16px;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(43, 91, 232, 0.28);
  overflow: hidden;

  // 右上角装饰圆
  &::before {
    content: '';
    position: absolute;
    top: -24px;
    right: -24px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
  }
  // 左下角装饰圆
  &::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -10px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
  }

  .hero-inner { position: relative; z-index: 1; }
  .hero-icon { font-size: 28px; margin-bottom: 6px; }
  .hero-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.3px;
    line-height: 1.2;
  }
  .hero-sub {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.82;
    letter-spacing: 0.3px;
  }
  .hero-source {
    margin-top: 6px;
    font-size: 10px;
    opacity: 0.55;
  }
}

// ========== 提示 ==========
.alert {
  background: #fff;
  border: 1px solid #ffd9c2;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  .alert-title {
    font-size: 14px;
    font-weight: 600;
    color: #c2410c;
    display: flex;
    align-items: center;
    gap: 6px;
    &::before {
      content: '⚠';
      font-size: 16px;
    }
  }
  .alert-msg {
    margin-top: 6px;
    font-size: 11px;
    color: #7c2d12;
    word-break: break-all;
  }
  .alert-tip {
    margin-top: 8px;
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.6;
  }
  &.alert-info {
    background: #f0f6ff;
    border-color: #bfdbfe;
    .alert-title {
      color: #1e40af;
      &::before { content: '⏳'; }
    }
    .alert-msg { color: #1e3a8a; }
    text-align: center;
  }
}

// ========== 表单卡片 ==========
.form-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 核心字段区：横向单行 */
.form-core {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.fc-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.fc-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  padding-left: 2px;
  svg { flex-shrink: 0; }
}
.fc-submit {
  height: 40px;
  padding: 0 24px;
  font-weight: 600;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(43, 91, 232, 0.3);
  transition: box-shadow 0.2s, transform 0.15s;
  &:hover {
    box-shadow: 0 5px 16px rgba(43, 91, 232, 0.4);
    transform: translateY(-1px);
  }
}

/* 更多筛选折叠区 */
.form-more { }
.fm-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  &:hover { color: #64748b; }
}
.fm-arrow {
  transition: transform 0.2s;
  &.fm-arrow--up { transform: rotate(180deg); }
}
.fm-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
}
.fm-footer {
  display: flex;
  justify-content: flex-end;
}

/* 通用表单行/格 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.form-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cell-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  svg { flex-shrink: 0; }
}
.form-row-tags {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 响应式 */
@media (max-width: 640px) {
  .form-core {
    flex-wrap: wrap;
    .fc-field:nth-child(1) { flex: 0 0 100%; }
    .fc-field:nth-child(2) { flex: 1 1 auto; }
    .fc-field:nth-child(3) { flex: 1 1 auto; }
    .fc-submit { flex: 0 0 100%; width: 100%; margin-top: 4px; }
  }
  .form-row { grid-template-columns: 1fr; }
}

/* 移动端卡片：分数列变窄，字体缩小 */
@media (max-width: 480px) {
  .school-card { flex-direction: column; }
  .sc-score-col {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    border-right: none;
    border-bottom: 1px solid #f1f5f9;
    padding: 10px 14px;
    justify-content: flex-start;
    gap: 8px;
  }
  .sc-score-val { font-size: 18px; }
  .sc-diff { margin-top: 0; }
  .sc-main { padding: 10px 14px; }
  .sc-name { font-size: 15px; }
}

// ========== 结果区 ==========
.result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 统计总览
.result-stat {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #1a3a8f, #2b5be8);
    border-radius: 12px;
    flex-shrink: 0;
    svg { color: #fff; }
  }
  .stat-body {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .stat-num {
    font-size: 36px;
    font-weight: 900;
    color: #1a3a8f;
    letter-spacing: -2px;
    line-height: 1;
  }
  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    margin-top: 2px;
  }
  .stat-divider {
    width: 1px;
    height: 36px;
    background: #e2e8f0;
    margin: 0 4px;
  }
  .stat-cond {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    .cond-item {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 10px;
      border-radius: 999px;
      svg { flex-shrink: 0; }
    }
  }
}

// 空结果
.result-empty {
  background: #fff;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-title { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 6px; }
  .empty-tip { font-size: 12px; color: #94a3b8; }
}

// 分组结果
.result-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 分组区块 */
.rg-section {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* 分组头部：白底 + 左侧竖条 */
.rg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.rg-bar {
  width: 4px;
  height: 20px;
  border-radius: 3px;
  flex-shrink: 0;
}
.rg-bar--danger { background: #ef4444; }
.rg-bar--primary { background: #2563eb; }
.rg-bar--success { background: #16a34a; }

.rg-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.rg-title--danger { color: #dc2626; }
.rg-title--primary { color: #1d4ed8; }
.rg-title--success { color: #15803d; }

.rg-desc {
  font-size: 11px;
  color: #94a3b8;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 4px;
}

.rg-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
}
.rg-count--danger { background: #fff1f0; color: #dc2626; }
.rg-count--primary { background: #eff6ff; color: #1d4ed8; }
.rg-count--success { background: #f0fdf4; color: #15803d; }

/* 院校卡片：左侧分数区 + 右侧信息区 */
.school-card {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
  &:hover { background: #fafbff; }
}

/* 左侧分数列 */
.sc-score-col {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  gap: 2px;
  border-right: 1px solid #f1f5f9;
}
.sc-score-val {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
  line-height: 1;
}
.sc-score-unit {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 1px;
}
.sc-rank {
  font-size: 9px;
  color: #94a3b8;
  margin-top: 2px;
}

/* 分数差徽章 */
.sc-diff {
  font-size: 11px;
  font-weight: 800;
  width: 42px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.2px;
  margin-top: 4px;
}
.sc-diff--danger { background: #fff1f0; color: #dc2626; }
.sc-diff--primary { background: #eff6ff; color: #1d4ed8; }
.sc-diff--success { background: #f0fdf4; color: #15803d; }

/* 右侧主信息区 */
.sc-main {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.sc-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.3px;
  line-height: 1.3;
}

/* 地理位置行 */
.sc-location {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sc-province {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #64748b;
  svg { color: #94a3b8; flex-shrink: 0; }
}

/* 标签组 */
.sc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.sc-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}
.sc-tag--in { background: #f0fdf4; color: #15803d; }
.sc-tag--out { background: #fff7ed; color: #c2410c; }
.sc-tag--level { background: #eff6ff; color: #1d4ed8; display: inline-flex; align-items: center; gap: 3px; }
.sc-tag--nature { background: #f5f3ff; color: #7c3aed; display: inline-flex; align-items: center; gap: 3px; }
.sc-tag--admit { background: #fef3c7; color: #b45309; display: inline-flex; align-items: center; gap: 3px; }
.sc-tag--feat { background: #f1f5f9; color: #475569; display: inline-flex; align-items: center; gap: 3px; }

/* 选科要求 */
.sc-subject {
  font-size: 10px;
  color: #94a3b8;
  &::before { content: '📌 '; font-size: 9px; }
}

/* 院校列表 */
.rg-body {
  display: flex;
  flex-direction: column;
  background: #fff;
}
.rg-empty {
  text-align: center;
  padding: 24px;
  font-size: 12px;
  color: #cbd5e1;
}

.placeholder {
  background: #fff;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 2px dashed #e2e8f0;
  .ph-icon { font-size: 48px; margin-bottom: 12px; }
  .ph-text {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }
  .ph-tip {
    margin-top: 10px;
    font-size: 11px;
    color: #94a3b8;
    line-height: 1.8;
  }
}

// ========== 页脚 ==========
.footer {
  text-align: center;
  font-size: 10px;
  color: #cbd5e1;
  padding: 6px 0;
  letter-spacing: 0.3px;
}

// ========== 过渡动画 ==========
.result-stat,
.result-empty,
.rg-section,
.placeholder {
  animation: fadeSlideUp 0.35s ease-out both;
}
.result-stat { animation-delay: 0s; }
.rg-section:nth-child(1) { animation-delay: 0.05s; }
.rg-section:nth-child(2) { animation-delay: 0.12s; }
.rg-section:nth-child(3) { animation-delay: 0.19s; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
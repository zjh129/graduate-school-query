<script setup lang="ts">
import { computed } from 'vue'
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

function onSubmit() {
  // 分数必填，其余均可空
  if (form.value.score == null || form.value.score <= 0) {
    ElMessage.warning('请输入高考分数')
    return
  }
  submit()
}

function diffText(score: number) {
  if (form.value.score == null) return '-'
  const diff = score - form.value.score
  return diff > 0 ? `+${diff}` : `${diff}`
}

function diffTone(score: number): 'danger' | 'primary' | 'success' {
  if (form.value.score == null) return 'primary'
  const diff = score - form.value.score
  if (diff > 20) return 'danger'
  if (diff >= -20) return 'primary'
  return 'success'
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

    <!-- 查询表单（参照掌上高考） -->
    <section class="form-card">
      <!-- 顶部：分数 + 选科 + 您所在省份 + 主按钮 -->
      <div class="form-row form-row-top">
        <div class="form-cell form-cell-score">
          <div class="cell-label">高考分数</div>
          <el-input
            v-model.number="form.score"
            type="number"
            placeholder="请输入分数"
            :min="0"
            :max="750"
            size="default"
          />
        </div>
        <div class="form-cell">
          <div class="cell-label">选科要求</div>
          <el-select v-model="form.subject" placeholder="全部" style="width: 100%">
            <el-option
              v-for="o in subjectOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
        <div class="form-cell form-cell-user">
          <div class="cell-label">您所在省份</div>
          <el-select
            v-model="form.userProvince"
            placeholder="不区分（单列）"
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
        <el-button type="primary" round size="default" class="form-submit" @click="onSubmit">
          智能匹配
        </el-button>
      </div>

      <!-- 第二行：省份 + 城市 -->
      <div class="form-row">
        <div class="form-cell">
          <div class="cell-label">所在地（省份）</div>
          <el-select
            v-model="form.province"
            placeholder="全部"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="o in provinceOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
        <div class="form-cell">
          <div class="cell-label">所在地（城市）</div>
          <el-select
            v-model="form.city"
            placeholder="全部"
            style="width: 100%"
            filterable
            :disabled="!form.province"
          >
            <el-option
              v-for="o in cityOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </div>
      </div>

      <!-- 第三行：院校层次 + 院校性质 -->
      <div class="form-row">
        <div class="form-cell">
          <div class="cell-label">院校层次</div>
          <el-select v-model="form.level" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option
              v-for="v in ALL_LEVELS"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </div>
        <div class="form-cell">
          <div class="cell-label">院校性质</div>
          <el-select v-model="form.nature" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option
              v-for="v in ALL_NATURES"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </div>
      </div>

      <!-- 第四行：招生类型 -->
      <div class="form-row">
        <div class="form-cell">
          <div class="cell-label">招生类型</div>
          <el-select v-model="form.admission" placeholder="全部" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option
              v-for="v in ALL_ADMISSION_TYPES"
              :key="v"
              :label="v"
              :value="v"
            />
          </el-select>
        </div>
        <div class="form-cell">
          <div class="cell-label">每组最多展示</div>
          <el-input-number
            v-model="form.limit"
            :min="1"
            :max="20"
            :step="1"
            controls-position="right"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 院校特色（多选标签） -->
      <div class="form-row form-row-tags">
        <div class="cell-label">院校特色</div>
        <div class="tag-list">
          <el-check-tag
            v-for="f in ALL_FEATURES"
            :key="f"
            :checked="form.features.includes(f)"
            @change="toggleFeature(f)"
          >
            {{ f }}
          </el-check-tag>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-row form-row-actions">
        <el-button round size="small" plain @click="reset">重置条件</el-button>
      </div>
    </section>

    <!-- 结果区 -->
    <section v-if="hasResult" class="result">
      <div class="result-summary">
        <span class="summary-tag">已选条件</span>
        <span v-if="form.userProvince" class="summary-item">您：{{ form.userProvince }}</span>
        <span v-if="form.province" class="summary-item">院校地：{{ form.province }}</span>
        <span v-if="form.city" class="summary-item">{{ form.city }}</span>
        <span v-if="form.level !== 'all'" class="summary-item">{{ form.level }}</span>
        <span v-if="form.nature !== 'all'" class="summary-item">{{ form.nature }}</span>
        <span v-if="form.admission !== 'all'" class="summary-item">{{ form.admission }}</span>
        <span v-if="form.subject" class="summary-item">{{ form.subject }}</span>
        <span v-if="form.features.length" class="summary-item">{{ form.features.join(' / ') }}</span>
        <span class="summary-item">分数 {{ form.score }}</span>
        <span class="summary-item">每组 {{ form.limit }} 所</span>
        <span class="summary-total">匹配 {{ totalMatch }} 所院校</span>
      </div>

      <div v-if="totalMatch === 0" class="empty">
        未找到符合条件的院校，请调整条件后重试
      </div>

      <!-- 单列分组结果：按难度分组 -->
      <div v-else class="result-groups">

        <!-- 冲一冲 -->
        <div class="rg-section">
          <div class="rg-header rg-header--danger">
            <span class="rg-title">冲一冲</span>
            <span class="rg-sub">投档分 &gt; 分数 +20</span>
            <span class="rg-count">
              {{ form.userProvince ? g_in(0).length + g_out(0).length : g_all(0).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(0).length + g_out(0).length : g_all(0).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(0)" :key="'in-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--danger">{{ idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--green">省内</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(0)" :key="'out-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--danger">{{ g_in(0).length + idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--orange">省外</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(0)" :key="idx" class="school-card">
                <div class="sc-rank sc-rank--danger">{{ idx + 1 }}</div>
                <div class="sc-info">
                  <div class="sc-name">
                    {{ s.学校名称 }}
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                  </div>
                  <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                </div>
                <div class="sc-score">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                  <div class="sc-score-diff sc-diff--danger">{{ diffText(s.投档分数) }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">无匹配院校</div>
          </div>
        </div>

        <!-- 稳一稳 -->
        <div class="rg-section">
          <div class="rg-header rg-header--primary">
            <span class="rg-title">稳一稳</span>
            <span class="rg-sub">±20 分以内</span>
            <span class="rg-count">
              {{ form.userProvince ? g_in(1).length + g_out(1).length : g_all(1).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(1).length + g_out(1).length : g_all(1).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(1)" :key="'in-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--primary">{{ idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--green">省内</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(1)" :key="'out-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--primary">{{ g_in(1).length + idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--orange">省外</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(1)" :key="idx" class="school-card">
                <div class="sc-rank sc-rank--primary">{{ idx + 1 }}</div>
                <div class="sc-info">
                  <div class="sc-name">
                    {{ s.学校名称 }}
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                  </div>
                  <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                </div>
                <div class="sc-score">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                  <div class="sc-score-diff sc-diff--primary">{{ diffText(s.投档分数) }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">无匹配院校</div>
          </div>
        </div>

        <!-- 保一保 -->
        <div class="rg-section">
          <div class="rg-header rg-header--success">
            <span class="rg-title">保一保</span>
            <span class="rg-sub">投档分 &lt; 分数 -20</span>
            <span class="rg-count">
              {{ form.userProvince ? g_in(2).length + g_out(2).length : g_all(2).length }}
            </span>
          </div>
          <div class="rg-body">
            <template v-if="form.userProvince ? g_in(2).length + g_out(2).length : g_all(2).length">
              <template v-if="form.userProvince">
                <div v-for="(s, idx) in g_in(2)" :key="'in-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--success">{{ idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--green">省内</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
                <div v-for="(s, idx) in g_out(2)" :key="'out-' + idx" class="school-card">
                  <div class="sc-rank sc-rank--success">{{ g_in(2).length + idx + 1 }}</div>
                  <div class="sc-info">
                    <div class="sc-name">
                      {{ s.学校名称 }}
                      <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                      <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                      <span class="sc-tag sc-tag--orange">省外</span>
                    </div>
                    <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                  </div>
                  <div class="sc-score">
                    <div class="sc-score-val">{{ s.投档分数 }}</div>
                    <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                    <div class="sc-score-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                  </div>
                </div>
              </template>
              <div v-else v-for="(s, idx) in g_all(2)" :key="idx" class="school-card">
                <div class="sc-rank sc-rank--success">{{ idx + 1 }}</div>
                <div class="sc-info">
                  <div class="sc-name">
                    {{ s.学校名称 }}
                    <span v-if="s.院校层次 === '本科'" class="sc-tag sc-tag--blue">本科</span>
                    <span v-for="f in s.院校特色" :key="f" class="sc-tag sc-tag--gray">{{ f }}</span>
                  </div>
                  <div class="sc-meta">{{ s.省份 }} · {{ s.城市 }}</div>
                </div>
                <div class="sc-score">
                  <div class="sc-score-val">{{ s.投档分数 }}</div>
                  <div class="sc-score-rank">位次 {{ s.最低位次 || '-' }}</div>
                  <div class="sc-score-diff sc-diff--success">{{ diffText(s.投档分数) }}</div>
                </div>
              </div>
            </template>
            <div v-else class="rg-empty">无匹配院校</div>
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
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  &:not(:last-child) {
    padding-bottom: 10px;
    border-bottom: 1px dashed #e8eef8;
  }
}
.form-section-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.form-row-top {
  grid-template-columns: 1fr 1fr 1fr auto;
  align-items: end;
  .form-cell-score :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 2px #2b7fff inset !important;
    border-radius: 10px;
  }
}
.form-row-actions {
  grid-template-columns: 1fr;
  display: flex;
  justify-content: flex-end;
}
.form-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cell-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.form-submit {
  height: 36px;
  padding: 0 22px;
  font-weight: 600;
  font-size: 14px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(43, 91, 232, 0.3);
  transition: box-shadow 0.2s, transform 0.15s;
  &:hover {
    box-shadow: 0 5px 16px rgba(43, 91, 232, 0.4);
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

// 响应式
@media (max-width: 768px) {
  .form-row-top {
    grid-template-columns: 1fr 1fr auto;
  }
  .form-row-top .form-cell-score { grid-column: 1 / -1; }
}
@media (max-width: 480px) {
  .form-row-top {
    grid-template-columns: 1fr 1fr;
  }
  .form-row-top .form-cell-user { grid-column: 1 / -1; }
  .form-row-top .form-submit { grid-column: 1 / -1; }
}

// ========== 结果区 ==========
.result-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);

  .summary-tag {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .summary-item {
    background: #eff4ff;
    color: #2b5be8;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 500;
    font-size: 11px;
  }
  .summary-total {
    margin-left: auto;
    color: #2b5be8;
    font-weight: 700;
    font-size: 12px;
    background: #eff4ff;
    padding: 3px 12px;
    border-radius: 999px;
  }
}

// ========== 分组结果 ==========
.result-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 分组区块 */
.rg-section {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1); }
}

/* 分组头部 */
.rg-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;

  .rg-title {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.5px;
  }
  .rg-sub {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.15);
    padding: 2px 8px;
    border-radius: 4px;
  }
  .rg-count {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    backdrop-filter: blur(4px);
  }
}
.rg-header--danger { background: linear-gradient(135deg, #e53e3e, #ff6b35); }
.rg-header--primary { background: linear-gradient(135deg, #2563eb, #2b7fff); }
.rg-header--success { background: linear-gradient(135deg, #059669, #16a34a); }

/* 院校列表 */
.rg-body {
  display: flex;
  flex-direction: column;
  background: #fff;
}
.rg-empty {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #cbd5e1;
}

/* 院校卡片 */
.school-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: default;
  transition: background 0.15s;
  position: relative;
  // 左侧彩色指示条
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 3px 3px 0;
    transition: height 0.2s;
  }
  &:last-child { border-bottom: none; }
  &:hover {
    background: #f8faff;
    &::before { height: 60%; }
  }
}
// 悬停时显示对应颜色指示条
.result-groups .rg-section:nth-child(1) .school-card:hover::before { background: #e53e3e; }
.result-groups .rg-section:nth-child(2) .school-card:hover::before { background: #2563eb; }
.result-groups .rg-section:nth-child(3) .school-card:hover::before { background: #16a34a; }

/* 排名徽章 */
.sc-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.sc-rank--danger { background: #fff1f0; color: #e53e3e; }
.sc-rank--primary { background: #e8f1ff; color: #2563eb; }
.sc-rank--success { background: #ecfdf5; color: #16a34a; }

/* 院校信息 */
.sc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sc-name {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}
.sc-meta {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  &::before {
    content: '📍';
    font-size: 9px;
  }
}

/* 标签 */
.sc-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.sc-tag--blue { background: #e8f1ff; color: #2563eb; }
.sc-tag--gray { background: #f1f5f9; color: #64748b; }
.sc-tag--green { background: #ecfdf5; color: #16a34a; }
.sc-tag--orange { background: #fff1eb; color: #ff6b35; }

/* 分数区 */
.sc-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.sc-score-val {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}
.sc-score-rank {
  font-size: 10px;
  color: #94a3b8;
}
.sc-score-diff {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
}
.sc-diff--danger { background: #fff1f0; color: #e53e3e; }
.sc-diff--primary { background: #e8f1ff; color: #2563eb; }
.sc-diff--success { background: #ecfdf5; color: #16a34a; }

// ========== 空状态 ==========
.empty {
  background: #fff;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; color: #94a3b8; font-weight: 500; }
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
.result-summary,
.rg-section,
.empty,
.placeholder {
  animation: fadeSlideUp 0.35s ease-out both;
}
.rg-section:nth-child(1) { animation-delay: 0.05s; }
.rg-section:nth-child(2) { animation-delay: 0.12s; }
.rg-section:nth-child(3) { animation-delay: 0.19s; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
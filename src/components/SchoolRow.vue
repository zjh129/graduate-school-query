<script setup lang="ts">
import type { ISchool } from '@/types/school'

defineProps<{
  school: ISchool
  rank: number
  diffText: string
  diffTone: 'danger' | 'primary' | 'success'
  /** 'in' 省内 | 'out' 省外 */
  inOrOut: 'in' | 'out'
  /** 排名徽章颜色 */
  rankTone: string
  rankToneBg: string
}>()
</script>

<template>
  <div
    class="school-rank"
    :style="{ color: rankTone, background: rankToneBg }"
  >{{ rank }}</div>
  <div class="school-main">
    <div class="school-name">
      {{ school.学校名称 }}
      <span
        v-if="school.院校层次 === '本科'"
        class="school-tag tag-blue"
      >本科</span>
      <span
        v-for="f in school.院校特色"
        :key="f"
        class="school-tag"
      >{{ f }}</span>
      <span class="school-tag" :class="inOrOut === 'in' ? 'tag-in' : 'tag-out'">
        {{ inOrOut === 'in' ? '省内' : '省外' }}
      </span>
    </div>
    <div class="school-meta">
      {{ school.省份 }} · {{ school.城市 }}
    </div>
  </div>
  <div class="school-score">
    <div class="score-value">{{ school.投档分数 }}</div>
    <div class="score-rank">位次 {{ school.最低位次 || '-' }}</div>
    <div class="score-diff" :class="`tone-${diffTone}`">{{ diffText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BeatIndicatorDot from './BeatIndicatorDot.vue';

const props = defineProps<{
  beats: number;
  currentBeat: number;
  isPlaying: boolean;
}>();

const beatIndices = computed(() => Array.from({ length: props.beats }, (_, i) => i));
</script>

<template>
  <div class="flex items-center justify-center gap-3">
    <BeatIndicatorDot
      v-for="(index) in beatIndices"
      :key="index"
      :is-active="isPlaying && currentBeat === index"
      :is-accent="index === 0"
    />
  </div>
</template>

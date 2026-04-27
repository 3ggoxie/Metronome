<script setup lang="ts">
import { Play, Pause } from 'lucide-vue-next';

defineProps<{
  isPlaying: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    type="button"
    class="w-16 h-16 rounded-full bg-primary hover:bg-orange-600 transition-colors flex items-center justify-center"
    @click="$emit('toggle')"
  >
    <Pause v-if="isPlaying" class="w-7 h-7 text-white" :fill="'white'" />
    <Play v-else class="w-7 h-7 text-white ml-1" :fill="'white'" />
  </button>
</template>

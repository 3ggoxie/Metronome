<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next';

defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();
</script>

<template>
  <div class="w-full space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm text-muted-foreground font-medium">Tempo</span>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-muted hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          @click="emit('update:modelValue', Math.max(20, modelValue - 1))"
        >
          <Minus class="w-4 h-4 text-foreground" />
        </button>
        <span class="text-4xl sm:text-5xl font-bold text-foreground w-16 sm:w-20 text-center tracking-tight">{{ modelValue }}</span>
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-muted hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          @click="emit('update:modelValue', Math.min(300, modelValue + 1))"
        >
          <Plus class="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
    <div class="relative px-1">
      <input
        type="range"
        :value="modelValue"
        min="20"
        max="300"
        class="w-full h-3 rounded-full appearance-none cursor-pointer accent-primary relative z-10"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />
      <!-- Custom track background for better visibility -->
      <div class="absolute top-1/2 left-0 right-0 h-2 bg-muted rounded-full -translate-y-1/2 pointer-events-none"></div>
    </div>
    <div class="flex justify-between text-xs text-muted-foreground px-1">
      <span>20</span>
      <span>300</span>
    </div>
  </div>
</template>

<style scoped>
input[type="range"] {
  background: transparent;
  position: relative;
  z-index: 2;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  background: #c9a86c;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.05);
}

input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #c9a86c;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>

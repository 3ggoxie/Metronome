<script setup lang="ts">
defineProps<{
  modelValue: number;
}>();

defineEmits<{
  'update:modelValue': [value: number];
}>();
</script>

<template>
  <div class="w-full space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm text-muted-foreground">Tempo</span>
      <span class="text-4xl font-bold text-foreground">{{ modelValue }}</span>
    </div>
    <input
      type="range"
      :value="modelValue"
      min="20"
      max="300"
      class="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
    <div class="flex justify-between text-xs text-muted-foreground">
      <span>20</span>
      <span>300</span>
    </div>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #f97316;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #f97316;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>

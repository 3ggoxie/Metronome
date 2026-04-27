<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Subdivision } from '@/types/metronome';

defineProps<{
  modelValue: Subdivision;
}>();

defineEmits<{
  'update:modelValue': [value: Subdivision];
}>();

const { t } = useI18n();

const subdivisions: Subdivision[] = [1, 2, 3, 4];
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm text-muted-foreground">{{ t('controls.subdivision') }}</label>
    <select
      :value="modelValue"
      class="w-full bg-muted text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary cursor-pointer"
      @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value) as Subdivision)"
    >
      <option v-for="sub in subdivisions" :key="sub" :value="sub">
        {{ t(`subdivisions.${sub}`) }}
      </option>
    </select>
  </div>
</template>

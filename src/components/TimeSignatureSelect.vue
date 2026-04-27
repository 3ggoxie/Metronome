<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TimeSignature } from '@/types/metronome';
import { TIME_SIGNATURES } from '@/constants/rhythmPatterns';

defineProps<{
  modelValue: TimeSignature;
}>();

defineEmits<{
  'update:modelValue': [value: TimeSignature];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm text-muted-foreground">{{ t('controls.timeSignature') }}</label>
    <select
      :value="modelValue.label"
      class="w-full bg-muted text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary cursor-pointer"
      @change="$emit('update:modelValue', TIME_SIGNATURES.find(ts => ts.label === ($event.target as HTMLSelectElement).value)!)"
    >
      <option v-for="option in TIME_SIGNATURES" :key="option.label" :value="option.label">
        {{ t(`timeSignatures.${option.label}`) }}
      </option>
    </select>
  </div>
</template>

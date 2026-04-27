<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { SoundType } from '@/types/metronome';

defineProps<{
  modelValue: SoundType;
}>();

defineEmits<{
  'update:modelValue': [value: SoundType];
}>();

const { t } = useI18n();

const sounds: SoundType[] = ['woodblock', 'metal', 'digital', 'hihat'];
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm text-muted-foreground">{{ t('controls.sound') }}</label>
    <select
      :value="modelValue"
      class="w-full bg-muted text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:border-primary cursor-pointer"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as SoundType)"
    >
      <option v-for="sound in sounds" :key="sound" :value="sound">
        {{ t(`sounds.${sound}`) }}
      </option>
    </select>
  </div>
</template>

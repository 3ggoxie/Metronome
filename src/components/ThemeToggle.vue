<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

const { t } = useI18n();
const { theme, setTheme } = useTheme();

const isOpen = ref(false);

const themes = [
  { value: 'light', icon: Sun, label: () => t('settings.light') },
  { value: 'dark', icon: Moon, label: () => t('settings.dark') },
  { value: 'system', icon: Monitor, label: () => t('settings.system') },
] as const;

const currentThemeIcon = () => {
  const current = themes.find(t => t.value === theme.value);
  return current?.icon ?? Monitor;
};
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm"
      @click="isOpen = !isOpen"
    >
      <component :is="currentThemeIcon()" class="w-4 h-4" />
      <span class="text-foreground hidden sm:inline">{{ t('settings.theme') }}</span>
      <ChevronDown class="w-3 h-3" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-50"
    >
      <button
        v-for="option in themes"
        :key="option.value"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
        @click="setTheme(option.value); isOpen = false"
      >
        <component :is="option.icon" class="w-4 h-4" />
        <span class="text-foreground">{{ option.label() }}</span>
        <span v-if="theme === option.value" class="ml-auto text-primary">✓</span>
      </button>
    </div>
  </div>
</template>

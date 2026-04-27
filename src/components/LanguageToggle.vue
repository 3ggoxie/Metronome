<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { availableLocales } from '@/i18n';
import { Globe, ChevronDown } from 'lucide-vue-next';
import { ref, computed } from 'vue';

const { locale } = useI18n();

const isOpen = ref(false);

const currentLocaleName = computed(() => {
  return availableLocales.find(l => l.code === locale.value)?.name ?? 'English';
});

const setLocale = (code: string) => {
  locale.value = code;
  localStorage.setItem('metronome-locale', code);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm"
      @click="isOpen = !isOpen"
    >
      <Globe class="w-4 h-4" />
      <span class="text-foreground hidden sm:inline">{{ currentLocaleName }}</span>
      <ChevronDown class="w-3 h-3" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-50"
    >
      <button
        v-for="option in availableLocales"
        :key="option.code"
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
        @click="setLocale(option.code)"
      >
        <span class="text-foreground">{{ option.name }}</span>
        <span v-if="locale === option.code" class="ml-auto text-primary">✓</span>
      </button>
    </div>
  </div>
</template>

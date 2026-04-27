<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme, type Theme } from '@/composables/useTheme';
import { availableLocales } from '@/i18n';
import gsap from 'gsap';

const props = withDefaults(defineProps<{
  compact?: boolean;
}>(), {
  compact: false,
});

const { locale, t } = useI18n();
const { theme, resolvedTheme, setTheme } = useTheme();

const localeIndex = ref(0);

watch(locale, () => {
  localeIndex.value = availableLocales.findIndex(l => l.code === locale.value);
}, { immediate: true });

const toggleLocale = () => {
  localeIndex.value = (localeIndex.value + 1) % availableLocales.length;
  const newLocale = availableLocales[localeIndex.value].code;
  locale.value = newLocale;
  localStorage.setItem('metronome-locale', newLocale);
};

const cycleTheme = () => {
  const themes: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = themes.indexOf(theme.value);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
};

const themeIconRef = ref<HTMLElement | null>(null);

const animateIcon = (el: HTMLElement | null) => {
  if (!el) return;
  const isDark = resolvedTheme.value === 'dark';

  gsap.timeline()
    .to(el, {
      scale: 0.75,
      rotate: isDark ? 0 : 180,
      duration: 0.12,
      ease: 'power2.in'
    })
    .to(el, {
      scale: 1,
      duration: 0.3,
      ease: 'elastic.out(1.2, 0.4)'
    });
};

watch(resolvedTheme, () => {
  animateIcon(themeIconRef.value);
});

onMounted(() => {
  gsap.from('.top-bar-btn', {
    opacity: 0,
    x: 20,
    stagger: 0.08,
    duration: 0.4,
    ease: 'power2.out'
  });
});
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 flex items-center px-3 sm:px-4 transition-all duration-300',
      props.compact ? 'h-12 justify-end' : 'h-14 sm:h-16 justify-center'
    ]"
  >
    <!-- Top bar pill - responsive sizing -->
    <div
      :class="[
        'glass-card rounded-full flex items-center transition-all duration-300',
        props.compact ? 'px-2 py-1 gap-0.5' : 'px-3 py-1.5 sm:px-4 sm:py-2 gap-1 sm:gap-2'
      ]"
    >
      <!-- Theme Toggle -->
      <button
        type="button"
        :class="[
          'top-bar-btn rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-black/10 active:scale-90',
          props.compact ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
        ]"
        @click="cycleTheme"
        :title="t('settings.theme')"
      >
        <div ref="themeIconRef" class="relative w-5 h-5">
          <svg
            v-if="resolvedTheme === 'dark'"
            class="w-5 h-5 text-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span
            v-if="theme === 'system'"
            class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"
          />
        </div>
      </button>

      <!-- Divider -->
      <div :class="['w-px bg-foreground/10', props.compact ? 'h-4' : 'h-5 sm:h-6']" />

      <!-- Language Toggle -->
      <button
        type="button"
        :class="[
          'top-bar-btn rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-black/10 active:scale-90',
          props.compact ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
        ]"
        @click="toggleLocale"
        :title="availableLocales[localeIndex]?.name"
      >
        <div ref="localeIconRef" class="relative w-5 h-5">
          <svg
            class="w-5 h-5 text-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span class="absolute -bottom-1.5 -right-1 text-[8px] font-bold text-primary leading-none">
            {{ availableLocales[localeIndex]?.code.toUpperCase().slice(0,2) }}
          </span>
        </div>
      </button>
    </div>
  </header>
</template>

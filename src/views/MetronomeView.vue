<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';
import { availableLocales } from '@/i18n';
import type { TimeSignature } from '@/types/metronome';
import { useMetronome } from '@/composables/useMetronome';
import { useViolin3D } from '@/composables/useViolin3D';
import MetronomeControls from '@/components/MetronomeControls.vue';
import gsap from 'gsap';

const { t, locale } = useI18n();
const { resolvedTheme, toggleTheme } = useTheme();

const containerRef = ref<HTMLDivElement | null>(null);
const isLargeScreen = ref(window.innerWidth >= 768);
const localeIndex = ref(0);
const thumbRef = ref<HTMLElement | null>(null);
const switchBtnRef = ref<HTMLElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);
const circleRef = ref<HTMLElement | null>(null);

const displayDark = ref(resolvedTheme.value === 'dark');

watch(resolvedTheme, (t) => {
  displayDark.value = t === 'dark';
});

watch(locale, () => {
  localeIndex.value = availableLocales.findIndex(l => l.code === locale.value);
}, { immediate: true });

const toggleLocale = () => {
  localeIndex.value = (localeIndex.value + 1) % availableLocales.length;
  const newLocale = availableLocales[localeIndex.value].code;
  locale.value = newLocale;
  localStorage.setItem('metronome-locale', newLocale);
};

const handleThemeToggle = () => {
  const overlay = overlayRef.value;
  const circle = circleRef.value;
  if (!overlay || !circle) {
    toggleTheme();
    return;
  }

  const btn = switchBtnRef.value;
  const rect = btn?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const btnW = rect ? rect.width : 0;
  const btnH = rect ? rect.height : 0;
  const maxR = Math.hypot(window.innerWidth, window.innerHeight);
  const targetColor = displayDark.value ? '#faf6f0' : '#0b0704';

  displayDark.value = !displayDark.value;

  gsap.set(circle, {
    left: cx,
    top: cy,
    width: btnW,
    height: btnH,
    backgroundColor: targetColor,
    opacity: 1,
  });
  overlay.style.display = 'block';

  gsap.to(circle, {
    width: maxR * 2,
    height: maxR * 2,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      toggleTheme();
      overlay.style.display = 'none';
    },
  });
};

const animateThumb = () => {
  const thumb = thumbRef.value;
  if (!thumb) return;
  gsap.timeline()
    .to(thumb, { scale: 0.8, duration: 0.1, ease: 'power2.in' })
    .to(thumb, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' });
};

watch(resolvedTheme, () => animateThumb());

useViolin3D(containerRef);

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 768;
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', updateScreenSize);
});

const {
  isPlaying,
  bpm,
  beatsPerMeasure,
  currentBeat,
  soundType,
  subdivision,
  toggle,
  setBpm,
  setBeatsPerMeasure,
  setSoundType,
  setSubdivision,
  handleKeydown,
} = useMetronome();

const handleTimeSignatureChange = (value: TimeSignature) => {
  setBeatsPerMeasure(value.beats);
};
</script>

<template>
  <div class="h-dvh overflow-hidden flex flex-col relative z-0" :class="{ dark: displayDark }">
    <!-- Transition overlay: circle expands behind content -->
    <div
      ref="overlayRef"
      class="absolute inset-0 z-[-1] overflow-hidden pointer-events-none"
      style="display: none;"
    >
      <div
        ref="circleRef"
        class="absolute rounded-full"
        style="transform: translate(-50%, -50%);"
      />
    </div>

    <!-- Top bar: settings right, title center -->
    <div class="shrink-0 flex items-center justify-center relative px-3 pt-4 md:pt-5 pb-1 md:pb-2">
      <!-- Settings buttons (right) -->
      <div class="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
        <!-- Theme switch -->
        <button
          ref="switchBtnRef"
          type="button"
          class="relative rounded-full transition-colors duration-300 cursor-pointer"
          :class="[
            displayDark
              ? 'bg-amber-500/25'
              : 'bg-foreground/10',
            'w-14 h-7 sm:w-15 sm:h-8 md:w-16 md:h-8'
          ]"
          role="switch"
          :aria-checked="displayDark"
          :aria-label="t('settings.theme')"
          @click="handleThemeToggle"
        >
          <span class="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500/60" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5"/>
            </svg>
            <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-400/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
          <span
            ref="thumbRef"
            class="absolute top-0.5 rounded-full bg-white shadow-md transition-[left] duration-300 ease-out flex items-center justify-center"
            :class="[
              displayDark
                ? 'left-7.5 sm:left-8.5 md:left-8.5'
                : 'left-0.5',
              'w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7'
            ]"
          >
            <svg
              v-if="displayDark"
              class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500"
              viewBox="0 0 24 24" fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg
              v-else
              class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500"
              viewBox="0 0 24 24" fill="currentColor"
            >
              <circle cx="12" cy="12" r="5"/>
            </svg>
          </span>
        </button>

        <!-- Language toggle -->
        <button
          type="button"
          class="rounded-lg flex items-center justify-center w-9 h-9 md:w-10 md:h-10 text-sm font-semibold transition-all duration-200 hover:bg-foreground/8 active:scale-90"
          :class="[
            isLargeScreen
              ? 'text-foreground/60 hover:text-foreground'
              : 'text-foreground/50'
          ]"
          @click="toggleLocale"
          :title="availableLocales[localeIndex]?.name"
        >
          {{ availableLocales[localeIndex]?.code.toUpperCase().slice(0, 2) }}
        </button>
      </div>

      <!-- Title -->
      <h1 class="text-lg sm:text-xl md:text-2xl font-semibold text-foreground/75 select-none">
        {{ t('app.title') }}
      </h1>
    </div>

    <!-- Main two-panel area: desktop side-by-side, mobile stacked -->
    <div class="flex flex-col md:flex-row flex-1 min-h-0 relative">

      <!-- CANVAS: desktop left panel, mobile below controls -->
      <div class="relative md:w-[42%] md:h-full md:overflow-hidden order-2 md:order-1 w-full flex-1 min-h-0 md:px-0">
        <div
          ref="containerRef"
          class="absolute inset-0 cursor-grab active:cursor-grabbing"
        />
      </div>

      <!-- CONTROLS: desktop right panel, mobile on top -->
      <div class="md:w-[58%] flex items-center justify-center px-3 py-3 sm:px-4 sm:py-4 md:py-0 order-1 md:order-2 shrink-0 overflow-y-auto">
        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg my-auto">
          <MetronomeControls
            :is-playing="isPlaying"
            :bpm="bpm"
            :beats-per-measure="beatsPerMeasure"
            :current-beat="currentBeat"
            :sound-type="soundType"
            :subdivision="subdivision"
            @toggle="toggle"
            @update:bpm="setBpm"
            @update:time-signature="handleTimeSignatureChange"
            @update:sound-type="setSoundType"
            @update:subdivision="setSubdivision"
          />

          <p class="text-center text-[10px] sm:text-xs opacity-30 mt-3 sm:mt-4">
            {{ t('app.shortcutHint', { key: t('app.spaceKey') }) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TimeSignature } from '@/types/metronome';
import { useMetronome } from '@/composables/useMetronome';
import { useViolinAnimation } from '@/composables/useViolinAnimation';
import TopBar from '@/components/TopBar.vue';
import MetronomeControls from '@/components/MetronomeControls.vue';

const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLargeScreen = ref(window.innerWidth >= 768);
const isCompact = computed(() => !isLargeScreen.value);

useViolinAnimation(canvasRef);

const updateScreenSize = () => {
  const newValue = window.innerWidth >= 768;
  if (isLargeScreen.value !== newValue) {
    isLargeScreen.value = newValue;
  }
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
  <div class="min-h-screen overflow-x-hidden">
    <!-- TopBar: centered on large, right-aligned on small -->
    <TopBar :compact="isCompact" />

    <!-- Main two-panel area below the fixed TopBar -->
    <div class="flex flex-col md:flex-row min-h-screen pt-12 md:pt-16">

      <!-- LEFT PANEL: canvas container -->
      <div class="md:relative md:w-[42%] md:min-h-[calc(100vh-4rem)] md:overflow-hidden">
        <canvas
          ref="canvasRef"
          :class="[
            'pointer-events-none transition-all duration-500 ease-in-out',
            isLargeScreen
              ? 'absolute inset-0 w-full h-full'
              : 'fixed top-1 left-2 w-9 h-11 z-50 rounded-lg shadow-lg'
          ]"
        />
        <!-- Vignette overlay on large screens -->
        <div
          v-if="isLargeScreen"
          class="absolute inset-0 pointer-events-none"
          style="background: radial-gradient(ellipse at 40% 50%, transparent 30%, var(--color-background) 90%);"
        />
      </div>

      <!-- RIGHT PANEL: controls -->
      <div class="md:w-[58%] flex items-center justify-center px-4 py-6 sm:py-8 md:py-0">
        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg">
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

          <p class="text-center text-xs opacity-30 mt-6">
            {{ t('app.shortcutHint', { key: t('app.spaceKey') }) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

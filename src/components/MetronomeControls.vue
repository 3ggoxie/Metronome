<script setup lang="ts">
import type { SoundType, TimeSignature, Subdivision } from '@/types/metronome';
import BeatIndicator from './BeatIndicator.vue';
import PlayPauseButton from './PlayPauseButton.vue';
import BpmControls from './BpmControls.vue';
import SoundSelector from './SoundSelector.vue';
import TimeSignatureSelect from './TimeSignatureSelect.vue';
import SubdivisionSelector from './SubdivisionSelector.vue';

defineProps<{
  isPlaying: boolean;
  bpm: number;
  beatsPerMeasure: number;
  currentBeat: number;
  soundType: SoundType;
  subdivision: Subdivision;
}>();

defineEmits<{
  toggle: [];
  'update:bpm': [value: number];
  'update:timeSignature': [value: TimeSignature];
  'update:soundType': [value: SoundType];
  'update:subdivision': [value: Subdivision];
}>();
</script>

<template>
  <div class="glass-card p-6 sm:p-8 space-y-6 sm:space-y-8">
    <!-- Beat Indicator -->
    <BeatIndicator
      :beats="beatsPerMeasure"
      :current-beat="currentBeat"
      :is-playing="isPlaying"
    />

    <!-- Play Button -->
    <div class="flex justify-center">
      <PlayPauseButton :is-playing="isPlaying" @toggle="$emit('toggle')" />
    </div>

    <!-- BPM Controls with fine-tuning -->
    <BpmControls
      :model-value="bpm"
      @update:model-value="$emit('update:bpm', $event)"
    />

    <!-- Selectors Grid -->
    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <TimeSignatureSelect
        :model-value="{ beats: beatsPerMeasure, noteValue: 4, label: `${beatsPerMeasure}/4` }"
        @update:model-value="$emit('update:timeSignature', $event)"
      />
      <SoundSelector
        :model-value="soundType"
        @update:model-value="$emit('update:soundType', $event)"
      />
      <SubdivisionSelector
        :model-value="subdivision"
        @update:model-value="$emit('update:subdivision', $event)"
      />
    </div>
  </div>
</template>

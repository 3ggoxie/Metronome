import { ref, computed, watch, onUnmounted } from 'vue';
import type { SoundType, Subdivision } from '@/types/metronome';
import { useAudioContext } from './useAudioContext';
import { useSoundGenerator } from './useSoundGenerator';

const LOOKAHEAD = 0.1; // 100ms look-ahead
const SCHEDULE_INTERVAL = 25; // Check every 25ms

export function useMetronome() {
  const { resume, getAudioContext, setVolume, getCurrentTime } = useAudioContext();
  const { playClick } = useSoundGenerator();

  const isPlaying = ref(false);
  const bpm = ref(120);
  const beatsPerMeasure = ref(4);
  const currentBeat = ref(0);
  const soundType = ref<SoundType>('woodblock');
  const volume = ref(0.5);
  const subdivision = ref<Subdivision>(1);

  let schedulerTimer: ReturnType<typeof setTimeout> | null = null;
  let nextNoteTime = 0;
  let currentSubdivisionCount = 0;

  const beatDuration = computed(() => 60 / bpm.value);
  const subdivisionDuration = computed(() => beatDuration.value / subdivision.value);

  const scheduleNote = (time: number, beat: number, isMainBeat: boolean) => {
    playClick({
      soundType: soundType.value,
      startTime: time,
      volume: volume.value,
      isAccent: isMainBeat && beat === 0,
    });
  };

  const scheduler = () => {
    const ctx = getAudioContext();
    const currentTime = ctx.currentTime;

    while (nextNoteTime < currentTime + LOOKAHEAD) {
      const isMainBeat = currentSubdivisionCount === 0;

      if (isMainBeat) {
        scheduleNote(nextNoteTime, currentBeat.value, true);
        currentBeat.value = (currentBeat.value + 1) % beatsPerMeasure.value;
      } else if (subdivision.value > 1) {
        // Play subdivision click (quieter)
        playClick({
          soundType: soundType.value,
          startTime: nextNoteTime,
          volume: volume.value * 0.5,
          isAccent: false,
        });
      }

      currentSubdivisionCount = (currentSubdivisionCount + 1) % subdivision.value;
      nextNoteTime += subdivisionDuration.value;
    }

    schedulerTimer = setTimeout(scheduler, SCHEDULE_INTERVAL);
  };

  const start = async () => {
    await resume();
    isPlaying.value = true;
    currentBeat.value = 0;
    currentSubdivisionCount = 0;
    nextNoteTime = getCurrentTime();
    scheduler();
  };

  const stop = () => {
    isPlaying.value = false;
    currentBeat.value = 0;
    currentSubdivisionCount = 0;
    if (schedulerTimer) {
      clearTimeout(schedulerTimer);
      schedulerTimer = null;
    }
  };

  const toggle = async () => {
    if (isPlaying.value) {
      stop();
    } else {
      await start();
    }
  };

  const setBpm = (newBpm: number) => {
    bpm.value = Math.max(20, Math.min(300, newBpm));
  };

  const setBeatsPerMeasure = (beats: number) => {
    beatsPerMeasure.value = beats;
    if (currentBeat.value >= beats) {
      currentBeat.value = 0;
    }
  };

  const setSoundType = (type: SoundType) => {
    soundType.value = type;
  };

  const setVolumeLevel = (vol: number) => {
    volume.value = Math.max(0, Math.min(1, vol));
    setVolume(volume.value);
  };

  const setSubdivision = (sub: Subdivision) => {
    subdivision.value = sub;
    currentSubdivisionCount = 0;
  };

  // Watch for volume changes
  watch(volume, (newVol) => {
    setVolume(newVol);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  // Keyboard shortcuts
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        toggle();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setBpm(bpm.value + 5);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setBpm(bpm.value - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setBpm(bpm.value + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setBpm(bpm.value - 1);
        break;
    }
  };

  return {
    isPlaying,
    bpm,
    beatsPerMeasure,
    currentBeat,
    soundType,
    volume,
    subdivision,
    toggle,
    start,
    stop,
    setBpm,
    setBeatsPerMeasure,
    setSoundType,
    setVolumeLevel,
    setSubdivision,
    handleKeydown,
  };
}

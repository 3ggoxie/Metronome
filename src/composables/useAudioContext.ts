import { ref, onUnmounted } from 'vue';

const audioContext = ref<AudioContext | null>(null);
const masterGain = ref<GainNode | null>(null);

export function useAudioContext() {
  const getAudioContext = (): AudioContext => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext();
      masterGain.value = audioContext.value.createGain();
      masterGain.value.connect(audioContext.value.destination);
      masterGain.value.gain.value = 0.5;
    }
    return audioContext.value;
  };

  const resume = async () => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  };

  const setVolume = (volume: number) => {
    if (masterGain.value) {
      masterGain.value.gain.value = Math.max(0, Math.min(1, volume));
    }
  };

  const getMasterGain = (): GainNode | null => masterGain.value;

  const getCurrentTime = (): number => {
    return getAudioContext().currentTime;
  };

  onUnmounted(() => {
    // Don't close the context on unmount as it may be reused
  });

  return {
    getAudioContext,
    resume,
    setVolume,
    getMasterGain,
    getCurrentTime,
  };
}

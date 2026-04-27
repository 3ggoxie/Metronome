import type { SoundType } from '@/types/metronome';
import { useAudioContext } from './useAudioContext';

interface SoundParams {
  soundType: SoundType;
  startTime: number;
  volume: number;
  isAccent: boolean;
}

export function useSoundGenerator() {
  const { getAudioContext, getMasterGain } = useAudioContext();

  const SOUND_CONFIGS: Record<SoundType, {
    oscillatorType: OscillatorType;
    frequency: number;
    attackTime: number;
    decayTime: number;
    noise?: boolean;
  }> = {
    woodblock: {
      oscillatorType: 'triangle',
      frequency: 800,
      attackTime: 0.005,
      decayTime: 0.1,
    },
    metal: {
      oscillatorType: 'sine',
      frequency: 2000,
      attackTime: 0.001,
      decayTime: 0.5,
    },
    digital: {
      oscillatorType: 'square',
      frequency: 1000,
      attackTime: 0.001,
      decayTime: 0.05,
    },
    hihat: {
      oscillatorType: 'sawtooth',
      frequency: 7000,
      attackTime: 0.001,
      decayTime: 0.07,
      noise: true,
    },
  };

  const playClick = (params: SoundParams) => {
    const ctx = getAudioContext();
    const masterGain = getMasterGain();
    if (!masterGain) return;

    const config = SOUND_CONFIGS[params.soundType];
    const { oscillatorType, frequency, attackTime, decayTime, noise } = config;
    const volumeMultiplier = params.isAccent ? 1.5 : 1;
    const volume = params.volume * volumeMultiplier;

    if (noise) {
      // Create noise using a buffer of random samples
      const bufferSize = ctx.sampleRate * decayTime;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // High-pass filter for hi-hat sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, params.startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.5, params.startTime + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, params.startTime + decayTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(masterGain);

      noiseSource.start(params.startTime);
      noiseSource.stop(params.startTime + decayTime);
    } else {
      // Create oscillator for tonal sounds
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Add second harmonic for woodblock
      if (params.soundType === 'woodblock') {
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = frequency * 0.5;

        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0, params.startTime);
        gain2.gain.linearRampToValueAtTime(volume * 0.3, params.startTime + attackTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, params.startTime + decayTime * 0.8);

        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.start(params.startTime);
        osc2.stop(params.startTime + decayTime);
      }

      osc.type = oscillatorType;
      osc.frequency.setValueAtTime(frequency, params.startTime);

      gainNode.gain.setValueAtTime(0, params.startTime);
      gainNode.gain.linearRampToValueAtTime(volume, params.startTime + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, params.startTime + decayTime);

      osc.connect(gainNode);
      gainNode.connect(masterGain);

      osc.start(params.startTime);
      osc.stop(params.startTime + decayTime);
    }
  };

  return {
    playClick,
  };
}

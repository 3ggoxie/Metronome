export type SoundType = 'woodblock' | 'metal' | 'digital' | 'hihat';

export interface TimeSignature {
  beats: number;
  noteValue: number;
  label: string;
}

export type Subdivision = 1 | 2 | 3 | 4;

export interface MetronomeOptions {
  bpm: number;
  beatsPerMeasure: number;
  soundType: SoundType;
  volume: number;
  subdivision: Subdivision;
}

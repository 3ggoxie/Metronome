import type { TimeSignature } from '@/types/metronome';

export const TIME_SIGNATURES: TimeSignature[] = [
  { beats: 4, noteValue: 4, label: '4/4' },
  { beats: 3, noteValue: 4, label: '3/4' },
  { beats: 2, noteValue: 4, label: '2/4' },
  { beats: 6, noteValue: 8, label: '6/8' },
  { beats: 5, noteValue: 4, label: '5/4' },
  { beats: 7, noteValue: 8, label: '7/8' },
];

export const SUBDIVISION_OPTIONS = [
  { value: 1, label: 'None' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

export const SOUND_OPTIONS = [
  { value: 'woodblock', label: 'Woodblock' },
  { value: 'metal', label: 'Metal' },
  { value: 'digital', label: 'Digital' },
  { value: 'hihat', label: 'Hi-Hat' },
] as const;

import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

const saved = localStorage.getItem('metronome-theme') as Theme | null;
const initial: Theme = saved === 'dark' ? 'dark' : 'light';

const theme = ref<Theme>(initial);
const resolvedTheme = ref<Theme>(initial);

if (initial === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export function useTheme() {
  const applyTheme = (t: Theme) => {
    resolvedTheme.value = t;
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem('metronome-theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  watch(theme, (t) => {
    applyTheme(t);
  });

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

import { ref, watch, onMounted } from 'vue';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const getSystemTheme = (): ResolvedTheme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const saved = (localStorage.getItem('metronome-theme') || 'system') as Theme;
const initial: Theme = ['light', 'dark', 'system'].includes(saved) ? saved : 'system';

const theme = ref<Theme>(initial);
const resolved = initial === 'system' ? getSystemTheme() : (initial as ResolvedTheme);
const resolvedTheme = ref<ResolvedTheme>(resolved);

// Apply the resolved theme class synchronously
if (resolved === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export function useTheme() {
  const resolveTheme = (): ResolvedTheme => {
    if (theme.value === 'system') return getSystemTheme();
    return theme.value;
  };

  const applyTheme = (r: ResolvedTheme) => {
    const prev = resolvedTheme.value;
    resolvedTheme.value = r;
    if (r !== prev) {
      if (r === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem('metronome-theme', newTheme);
    applyTheme(resolveTheme());
  };

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme(getSystemTheme());
      }
    });
  });

  watch(theme, () => {
    applyTheme(resolveTheme());
  });

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}

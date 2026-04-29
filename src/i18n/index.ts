import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import enUS from './en-US';

const savedLocale = localStorage.getItem('metronome-locale') || 'zh-CN';

export const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

export const availableLocales = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
] as const;

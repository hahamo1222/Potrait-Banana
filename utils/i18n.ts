import { useAppState } from '../store/AppContext';
import en from '../locales/en.json';
import zh from '../locales/zh.json';

type Dict = Record<string, string>;

const dictionaries: Record<'en'|'zh', Dict> = {
  en: en as Dict,
  zh: zh as Dict,
};

export function useI18n() {
  const { language } = useAppState();
  const dict = dictionaries[language] || dictionaries.zh;
  function t(key: string, fallback?: string): string {
    return dict[key] ?? fallback ?? key;
  }
  return { t, lang: language };
}



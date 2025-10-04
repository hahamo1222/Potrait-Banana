import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type LanguageCode = 'en' | 'zh';

export interface DemoUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface SubscriptionState {
  isPro: boolean;
  expireAt?: number; // epoch ms
}

export interface GenerationItemSummary {
  id: string;
  createdAt: number;
  styleCount: number;
  status: 'queued' | 'running' | 'success' | 'failed';
}

export interface AppState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  user: DemoUser | null;
  setUser: (u: DemoUser | null) => void;

  subscription: SubscriptionState;
  setSubscription: (s: SubscriptionState) => void;

  generations: GenerationItemSummary[];
  setGenerations: (items: GenerationItemSummary[]) => void;

  // Quota (per day for Free): default 5
  dailyFreeQuota: number;
  usedToday: number;
  setUsedToday: (n: number) => void;

  // Simple in-memory rate limit token bucket (front-end only demo)
  tokens: number;
  lastRefillAt: number;
  tryConsumeToken: () => { ok: boolean; cooldownMs?: number };
}

const AppContext = createContext<AppState | undefined>(undefined);

const LS_LANG_KEY = 'pb.lang';
const LS_USER_KEY = 'pb.user';
const LS_SUB_KEY = 'pb.sub';
const LS_USED_TODAY = 'pb.usedToday';
const LS_USED_TODAY_AT = 'pb.usedTodayAt';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(LS_LANG_KEY) as LanguageCode | null;
    if (saved === 'en' || saved === 'zh') return saved;
    return 'zh';
  });

  const [user, setUserState] = useState<DemoUser | null>(() => {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) as DemoUser : null;
  });

  const [subscription, setSubscriptionState] = useState<SubscriptionState>(() => {
    const raw = localStorage.getItem(LS_SUB_KEY);
    return raw ? JSON.parse(raw) as SubscriptionState : { isPro: false };
  });

  const [generations, setGenerations] = useState<GenerationItemSummary[]>([]);

  // Quota state
  const [dailyFreeQuota] = useState<number>(5);
  const [usedToday, setUsedTodayState] = useState<number>(() => {
    const dayKey = localStorage.getItem(LS_USED_TODAY_AT);
    const today = new Date().toDateString();
    if (dayKey !== today) {
      localStorage.setItem(LS_USED_TODAY_AT, today);
      localStorage.setItem(LS_USED_TODAY, '0');
      return 0;
    }
    const raw = localStorage.getItem(LS_USED_TODAY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  });

  // Simple token bucket: capacity 3, refill 1 token / 2s
  const [tokens, setTokens] = useState<number>(3);
  const [lastRefillAt, setLastRefillAt] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastRefillAt;
      const toAdd = Math.floor(elapsed / 2000); // 1 token / 2s
      if (toAdd > 0) {
        setTokens(prev => Math.min(3, prev + toAdd));
        setLastRefillAt(now);
      }
    }, 500);
    return () => clearInterval(id);
  }, [lastRefillAt]);

  const tryConsumeToken = useCallback(() => {
    if (tokens > 0) {
      setTokens(tokens - 1);
      return { ok: true } as const;
    }
    // estimate cooldown
    const cooldownMs = Math.max(0, 2000 - (Date.now() - lastRefillAt));
    return { ok: false, cooldownMs } as const;
  }, [tokens, lastRefillAt]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(LS_LANG_KEY, lang);
  }, []);

  const setUser = useCallback((u: DemoUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(LS_USER_KEY);
  }, []);

  const setSubscription = useCallback((s: SubscriptionState) => {
    setSubscriptionState(s);
    localStorage.setItem(LS_SUB_KEY, JSON.stringify(s));
  }, []);

  const setUsedToday = useCallback((n: number) => {
    setUsedTodayState(n);
    localStorage.setItem(LS_USED_TODAY, String(n));
    localStorage.setItem(LS_USED_TODAY_AT, new Date().toDateString());
  }, []);

  const value = useMemo<AppState>(() => ({
    language,
    setLanguage,
    user,
    setUser,
    subscription,
    setSubscription,
    generations,
    setGenerations,
    dailyFreeQuota,
    usedToday,
    setUsedToday,
    tokens,
    lastRefillAt,
    tryConsumeToken,
  }), [language, user, subscription, generations, dailyFreeQuota, usedToday, tokens, lastRefillAt, setLanguage, setUser, setSubscription, setGenerations, setUsedToday, tryConsumeToken]);

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}



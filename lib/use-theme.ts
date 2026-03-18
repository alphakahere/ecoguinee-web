'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';

function getSnapshot() {
  return localStorage.getItem('ecoguinee-theme') !== 'light';
}

function getServerSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useTheme() {
  const initialDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dark, setDarkState] = useState(initialDark);

  const applyTheme = useCallback((v: boolean) => {
    setDarkState(v);
    document.documentElement.classList.toggle('dark', v);
    localStorage.setItem('ecoguinee-theme', v ? 'dark' : 'light');
  }, []);

  // Apply on first render
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark);
  }

  const toggle = useCallback(() => {
    applyTheme(!dark);
  }, [dark, applyTheme]);

  return { dark, toggle, setDark: applyTheme };
}

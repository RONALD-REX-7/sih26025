'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/lib/offline/offline-store';

export function PwaRegister() {
  const initNetworkListeners = useOfflineStore((s) => s.initNetworkListeners);

  useEffect(() => {
    initNetworkListeners();

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }, [initNetworkListeners]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SCROLL_KEY = `scroll-${pathname}`;

    // Restore scroll position
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (savedScroll !== null) {
      const scrollY = parseInt(savedScroll, 10);
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }

    // Save scroll position before leaving page or on unload
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, Math.floor(window.scrollY).toString());
    };

    // Save on scroll (throttled)
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(saveScroll, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScroll);
      // Final save
      saveScroll();
    };
  }, [pathname]);

  return null;
}

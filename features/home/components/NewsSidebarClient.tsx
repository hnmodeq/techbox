'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ContentItem } from '@/lib/content';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { zIndex } from '@/design';
import { sidebarBase } from '@/config/sidebar.config';

export default function NewsSidebarClient({ newsItems }: { newsItems: ContentItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 640) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  if (pathname !== '/') return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ zIndex: zIndex.mobileFab }}
          className="fixed left-0 top-6 select-none rounded-r-[var(--corner-radius)] bg-[var(--card-background)] border-[length:var(--border-size)] border-l-0 border-[var(--border-color)] p-2.5 text-[var(--news)] shadow-[var(--shadow-size)] transition-all duration-[300ms] hover:bg-[var(--muted-background)] cursor-pointer"
          title="اخبار زنده تکباکس"
          aria-label="اخبار زنده تکباکس"
        >
          <Icon name="news" className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm sm:hidden" style={{ zIndex: zIndex.sidebarBackdrop }} onClick={() => setOpen(false)} />
      )}

      <div className={`hidden shrink-0 sm:block transition-[width] duration-[300ms] ease-[ease] ${open ? 'w-80' : 'w-0'}`} aria-hidden="true" />

      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen w-80 flex flex-col overflow-hidden transition-transform duration-[300ms] ease-[ease] ${sidebarBase} ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: zIndex.sidebar }}
        dir="rtl"
      >
        <div className="p-5 border-b-[length:var(--border-size)] border-[var(--border-color)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Icon name="news" className="h-5 w-5 text-[var(--news)]" />
            <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold font-black text-[var(--primary-text)]">اخبار زنده تکباکس</h3>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-1.5 paragraph-color hover:text-[var(--news)] transition-colors cursor-pointer" title="بستن"><Icon name="chevronLeft" className="h-5 w-5 rtl:rotate-180" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {newsItems.map((n) => (
            <Link key={n.slug} href={`/news/${n.slug}`} onClick={() => setOpen(false)} className="group block px-2 sm:px-3">
              <div className="relative aspect-[3/1] w-full rounded-[var(--corner-radius)] overflow-hidden bg-[var(--muted-background)] mb-3 border-[length:var(--border-size)] border-[var(--border-color)]/50">
                <Image src={n.image || '/assets/blog-1.jpg'} alt={n.title} fill className="object-cover" sizes="320px" />
              </div>
              <div className="text-[11px] paragraph-color mb-1 font-bold"><span>{n.date_fa} {n.time || ''}</span></div>
              <h4 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold text-[var(--primary-text)] group-hover:text-[var(--news)] transition-colors line-clamp-2 leading-6">{n.title}</h4>
              <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mt-1.5 line-clamp-2 leading-5">{n.excerpt}</p>
            </Link>
          ))}
        </div>

        <div className="p-3.5 border-t-[length:var(--border-size)] border-[var(--border-color)] text-center shrink-0">
          <Link href="/news" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--corner-radius)] font-semibold transition-all cursor-pointer bg-transparent text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] hover:bg-[var(--button-background)]/40 w-full text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-[var(--news)] font-bold">
            مشاهده آرشیو کامل اخبار ←
          </Link>
        </div>
      </aside>
    </>
  );
}
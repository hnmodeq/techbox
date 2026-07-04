'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getModuleItems } from '@/lib/content';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { zIndex } from '@/design';
import { sidebarBase } from '@/config/sidebar.config';

export default function NewsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const newsItems = getModuleItems('news').slice(0, 15);

  // Close when clicking outside ONLY on mobile devices (sm: hidden)
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

  // Only active on homepage per user request
  if (pathname !== '/') return null;

  return (
    <>
      {/* Floating Left Edge Toggle Button (styled like main sidebar button) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ zIndex: zIndex.mobileFab }}
        className={`fixed left-0 top-6 select-none rounded-r-[var(--tb-radius-lg)] bg-[var(--tb-bg-secondary)] border border-l-0 border-[var(--tb-border)] p-2.5 text-[var(--tb-news)] shadow-[var(--tb-shadow-lg)] transition-all duration-[var(--tb-motion-lg)] hover:bg-[var(--tb-bg-muted)] cursor-pointer ${
          open ? 'left-80' : 'left-0'
        }`}
        title={open ? 'بستن اخبار فوری' : 'باز کردن اخبار فوری'}
        aria-label="اخبار فوری"
      >
        <Icon name="news" className="h-6 w-6" />
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm sm:hidden"
          style={{ zIndex: zIndex.sidebarBackdrop }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop Layout Width Spacer (Compresses <main> width smoothly when open) */}
      <div
        className={`hidden shrink-0 sm:block transition-[width] duration-[var(--tb-motion-lg)] ease-[var(--tb-ease)] ${
          open ? 'w-80' : 'w-0'
        }`}
        aria-hidden="true"
      />

      {/* Fixed Left Sidebar Panel */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen w-80 flex flex-col overflow-hidden transition-transform duration-[var(--tb-motion-lg)] ease-[var(--tb-ease)] ${sidebarBase} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: zIndex.sidebar }}
        dir="rtl"
      >
        {/* Clean Header WITHOUT background fill and WITHOUT X button */}
        <div className="p-5 border-b border-[var(--tb-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Icon name="news" className="h-5 w-5 text-[var(--tb-news)]" />
            <h3 className="tb-text-lg font-black text-[var(--tb-fg-primary)]">اخبار زنده تکباکس</h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 text-[var(--tb-fg-muted)] hover:text-[var(--tb-news)] transition-colors cursor-pointer"
            title="بستن"
          >
            <Icon name="chevronLeft" className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>

        {/* Scrollable News List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-[var(--tb-border)]/40">
          {newsItems.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              onClick={() => setOpen(false)}
              className="group block pt-4 first:pt-0"
            >
              {/* Wide Banner Image (less height, full width aspect-[3/1]) */}
              <div className="relative aspect-[3/1] w-full rounded-[var(--tb-radius-md)] overflow-hidden bg-[var(--tb-bg-muted)] mb-3 border border-[var(--tb-border)]/50">
                <Image
                  src={n.image || '/assets/blog-1.jpg'}
                  alt={n.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="320px"
                />
              </div>

              {/* Date & Time (Tags & Views Counter hidden per request) */}
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--tb-fg-muted)] mb-1">
                <Icon name="clock" className="h-3 w-3 text-[var(--tb-news)]" />
                <span>{n.date_fa} {n.time || ''}</span>
              </div>

              <h4 className="tb-text-md font-bold text-[var(--tb-fg-primary)] group-hover:text-[var(--tb-news)] transition-colors line-clamp-2 leading-6">
                {n.title}
              </h4>

              {/* News Description */}
              <p className="tb-text-sm text-[var(--tb-fg-muted)] mt-1.5 line-clamp-2 leading-5">
                {n.excerpt}
              </p>
            </Link>
          ))}
        </div>

        {/* Footer Link */}
        <div className="p-3.5 border-t border-[var(--tb-border)] text-center shrink-0">
          <Link
            href="/news"
            onClick={() => setOpen(false)}
            className="btn btn-ghost w-full tb-text-sm text-[var(--tb-news)] font-bold"
          >
            مشاهده آرشیو کامل اخبار ←
          </Link>
        </div>
      </aside>
    </>
  );
}

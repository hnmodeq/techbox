'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHomeModule } from '@/features/home/lib/home-data';
import Link from 'next/link';
import Image from 'next/image';
import { blurProps } from "@/lib/image-placeholder";
import { usePathname } from 'next/navigation';
import { zIndex } from '@/design';
import { Card, CardContent } from '@/components/ui/card';
import { Button, ButtonLink } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, ChevronLeft, Clock3 } from 'lucide-react';
import { CardStats } from '@/components/ui/card-stats';

const NEWS_SIDEBAR_OPEN_KEY = 'techbox-news-sidebar-open';

function readSavedOpenState() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(NEWS_SIDEBAR_OPEN_KEY) === 'true';
}

// Rebuilt with shadcn: Button + ScrollArea + Card + Badge + Separator + Skeleton
// Keeps original behavior: homepage only, left-edge toggle, mobile backdrop, desktop spacer that pushes <main>
export default function NewsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { items: dbNews, loading } = useHomeModule('news');
  const newsItems = dbNews.slice(0, 15);

  useEffect(() => {
    const savedOpen = readSavedOpenState();
    setOpen(savedOpen);
    document.documentElement.dataset.newsSidebarOpen = String(savedOpen);
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('news-sidebar-booting');
    });
  }, []);

  const setPersistedOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NEWS_SIDEBAR_OPEN_KEY, String(nextOpen));
      document.documentElement.dataset.newsSidebarOpen = String(nextOpen);
    }
  };

  // Close when clicking outside ONLY on mobile
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 640) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setPersistedOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  if (pathname !== '/') return null;

  return (
    <>
      {/* Left Edge Toggle — shadcn Button */}
      {!open && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPersistedOpen(true)}
          style={{ zIndex: zIndex.mobileFab }}
          className="news-sidebar-toggle fixed left-0 top-6 select-none rounded-r-lg bg-card border-l-0 text-[var(--news)] shadow-md"
          aria-label="اخبار زنده تکباکس"
          title="اخبار زنده تکباکس"
        >
          <Newspaper className="size-5" />
        </Button>
      )}

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm sm:hidden"
          style={{ zIndex: zIndex.sidebarBackdrop }}
          onClick={() => setPersistedOpen(false)}
        />
      )}

      {/* Desktop Spacer — pushes main */}
      <div
        className={`news-sidebar-spacer hidden shrink-0 sm:block transition-[width] duration-300 ease-[ease] ${
          open ? 'w-80' : 'w-0'
        }`}
        aria-hidden="true"
      />

      {/* Fixed Left Sidebar Panel — now using Card + ScrollArea */}
      <aside
        ref={sidebarRef}
        className={`news-sidebar-panel fixed left-0 top-0 h-screen w-80 flex flex-col overflow-hidden bg-sidebar border-e shadow-sm transition-transform duration-300 ease-[ease] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: zIndex.sidebar }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 shrink-0 border-b">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--news)_12%,var(--muted))] text-[var(--news)]">
              <Newspaper className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">اخبار زنده تکباکس</h3>
            <Badge variant="news" className="ms-1">Live</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPersistedOpen(false)}
            aria-label="بستن"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
        </div>

        {/* Scrollable List — shadcn ScrollArea */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="p-0 overflow-hidden">
                  <CardContent className="p-3 space-y-3">
                    <Skeleton className="aspect-[3/1] w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}

            {!loading && newsItems.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">خبری در دیتابیس ثبت نشده است.</div>
            )}

            {!loading &&
              newsItems.map((n) => (
                <Card key={n.slug} className="group overflow-hidden p-0 hover:bg-accent/50 transition-colors">
                  <Link href={`/news/${n.slug}`} onClick={() => setPersistedOpen(false)} className="block">
                    <div className="relative aspect-[3/1] w-full overflow-hidden bg-muted">
                      <Image
                        src={n.image || '/assets/blog-1.jpg'}
                        alt={n.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="320px"
                        {...blurProps(n.image || '/assets/blog-1.jpg')}
                      />
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock3 className="size-3" />
                        <span>{n.date_fa} {n.time || ''}</span>
                      </div>
                      <h4 className="text-[13px] font-semibold leading-6 line-clamp-2 group-hover:text-[var(--news)] transition-colors">
                        {n.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-5">{n.excerpt}</p>
                      <Separator className="my-1" />
                      <CardStats module="news" slug={n.slug} showComments={true} />
                    </CardContent>
                  </Link>
                </Card>
              ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t shrink-0 bg-card">
          <ButtonLink href="/news" variant="outline" size="sm" className="w-full justify-center text-[var(--news)]" onClick={() => setPersistedOpen(false)}>
            مشاهده آرشیو کامل اخبار ←
          </ButtonLink>
        </div>
      </aside>
    </>
  );
}

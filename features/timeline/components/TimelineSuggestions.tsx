'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth.provider';

type Suggestion = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'لحظاتی پیش';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000).toLocaleString('fa-IR')} دقیقه پیش`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000).toLocaleString('fa-IR')} ساعت پیش`;
    return `${Math.floor(diff / 86_400_000).toLocaleString('fa-IR')} روز پیش`;
  } catch {
    return '';
  }
}

export function TimelineSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    fetch('/api/timeline/suggestions', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (mounted) setSuggestions(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    if (!user) {
      window.dispatchEvent(new CustomEvent('tb_open_auth'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/timeline/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('tb_open_auth'));
        setSubmitting(false);
        return;
      }

      if (res.ok) {
        const created = await res.json();
        setSuggestions((prev) => [
          {
            id: created.id,
            authorName: created.authorName || 'شما',
            text: created.text,
            createdAt: created.createdAt || new Date().toISOString(),
          },
          ...prev,
        ]);
        setText('');
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || err.error || 'خطا در ثبت پیشنهاد');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width: 380 }}>
      {/* Spacer to align with cards */}
      <div className="h-6" />
      {/* Dot on the line */}
      <div className="relative z-10 size-4 rounded-full border-2 border-background bg-primary shadow-sm" />
      {/* Box */}
      <div className="mt-4 w-full rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 440 }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-bold text-foreground">پیشنهاد رویداد جدید</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            چه رویدادی را در تایم‌لاین کم دارید؟ پیشنهاد شما برای همه قابل مشاهده است.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-border bg-card">
          <div className="flex gap-2">
            <Input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              placeholder="مثلاً: انتشار اولین نسخه ویندوز سرور 2025"
              className="h-9 flex-1 text-sm"
              maxLength={500}
              disabled={submitting}
            />
            <Button type="submit" size="sm" className="h-9 shrink-0" disabled={submitting || !text.trim()}>
              {submitting ? '...' : 'ثبت'}
            </Button>
          </div>
          {error && <p className="text-[11px] text-destructive mt-1.5">{error}</p>}
        </form>

        {/* Suggestions list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1.5">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">هنوز پیشنهادی ثبت نشده است.</p>
              <p className="text-[11px] text-muted-foreground mt-1">اولین نفر باشید!</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {suggestions.map((s) => (
                <li key={s.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-primary">{s.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(s.createdAt)}</span>
                  </div>
                  <p className="text-xs text-foreground leading-5">{s.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

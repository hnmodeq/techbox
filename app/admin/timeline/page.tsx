"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ChevronDown, ChevronLeft, Clock } from "lucide-react";
import { getJalaliDateStringPersian } from "@/lib/jalali";

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  dateGr: string;
  dateFa: string;
  year: number;
  yearFa: number;
  importance: number;
  tags?: string[];
  published: boolean;
};

export default function AdminTimelinePage() {
  return (
    <AdminGuard>
      {(user) => <TimelineContent isSuperAdmin={user.role === "super_admin"} />}
    </AdminGuard>
  );
}

function TimelineContent({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDateGr, setFormDateGr] = useState("");
  const [formDateFa, setFormDateFa] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formYearFa, setFormYearFa] = useState("");
  const [formImportance, setFormImportance] = useState("5");
  const [formPublished, setFormPublished] = useState(true);
  const [formBusy, setFormBusy] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/timeline/events", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("خطا در دریافت رویدادها");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingEvent(null);
    resetForm();
    setShowForm(true);
  }

  function openEdit(event: TimelineEvent) {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormImage(event.image || "");
    setFormDateGr(event.dateGr ? new Date(event.dateGr).toISOString().slice(0, 10) : "");
    setFormDateFa(event.dateFa || "");
    setFormYear(String(event.year || ""));
    setFormYearFa(String(event.yearFa || ""));
    setFormImportance(String(event.importance || 5));
    setFormPublished(event.published);
    setShowForm(true);
  }

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormImage("");
    setFormDateGr("");
    setFormDateFa("");
    setFormYear("");
    setFormYearFa("");
    setFormImportance("5");
    setFormPublished(true);
  }

  async function handleSubmit() {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("عنوان و توضیحات الزامی است");
      return;
    }
    setFormBusy(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        image: formImage.trim() || null,
        dateGr: formDateGr ? new Date(formDateGr).toISOString() : new Date().toISOString(),
        dateFa: formDateFa.trim(),
        year: formYear ? parseInt(formYear) : new Date().getFullYear(),
        yearFa: formYearFa ? parseInt(formYearFa) : 1404,
        importance: parseInt(formImportance) || 5,
        published: formPublished,
      };

      const url = editingEvent
        ? `/api/timeline/events/${editingEvent.id}`
        : "/api/timeline/events";
      const method = editingEvent ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingEvent ? "رویداد ویرایش شد" : "رویداد ایجاد شد");
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "خطا در ذخیره");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا از حذف این رویداد اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/timeline/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("رویداد حذف شد");
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error("خطا در حذف");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  }

  const filteredEvents = events.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.dateFa.includes(q)
    );
  });

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="size-5" />
            گاه‌شمار تکنولوژی
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} رویداد ثبت شده
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchEvents}>
            به‌روزرسانی
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4 me-1" />
            رویداد جدید
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در عنوان، توضیحات، تاریخ..."
          className="h-8"
        />
      </Card>

      {/* Events List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-3 w-32 mb-3" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query ? "نتیجه‌ای پیدا نشد." : "هنوز رویدادی ثبت نشده."}
          </p>
          {!query && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <Plus className="size-4 me-1" />
              اولین رویداد را ایجاد کنید
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                className="flex w-full items-center gap-3 p-4 text-right hover:bg-muted/30 transition-colors"
              >
                <div className="flex size-8 items-center justify-center rounded bg-muted text-xs font-bold shrink-0">
                  {event.yearFa}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.dateFa || getJalaliDateStringPersian(new Date(event.dateGr))}
                    {!event.published && (
                      <Badge variant="outline" className="ms-2 text-[10px]">پیش‌نویس</Badge>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  اهمیت: {event.importance}
                </Badge>
                <ChevronDown
                  className={`size-4 text-muted-foreground shrink-0 transition-transform ${
                    expandedId === event.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === event.id && (
                <div className="border-t p-4 space-y-3 bg-muted/10">
                  <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
                    {event.description}
                  </p>
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <Separator />
                  <div className="flex gap-2">
                    <Button size="xs" variant="outline" onClick={() => openEdit(event)}>
                      <Edit className="size-3 me-1" />
                      ویرایش
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="size-3 me-1" />
                      حذف
                    </Button>
                    {event.image && (
                      <ButtonLink href={event.image} target="_blank" size="xs" variant="ghost">
                        مشاهده تصویر
                      </ButtonLink>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditingEvent(null); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "ویرایش رویداد" : "رویداد جدید"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">عنوان *</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="عنوان رویداد"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">توضیحات *</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="توضیحات کامل رویداد"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">تاریخ میلادی</Label>
                <Input
                  type="date"
                  value={formDateGr}
                  onChange={(e) => setFormDateGr(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">تاریخ شمسی</Label>
                <Input
                  value={formDateFa}
                  onChange={(e) => setFormDateFa(e.target.value)}
                  placeholder="۱۴۰۴/۰۴/۱۵"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">سال میلادی</Label>
                <Input
                  type="number"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  placeholder="2025"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">سال شمسی</Label>
                <Input
                  type="number"
                  value={formYearFa}
                  onChange={(e) => setFormYearFa(e.target.value)}
                  placeholder="1404"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">اهمیت (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formImportance}
                  onChange={(e) => setFormImportance(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">تصویر (URL)</Label>
              <Input
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-xs">منتشر شده</Label>
                <p className="text-[10px] text-muted-foreground">
                  {formPublished ? "قابل مشاهده برای عموم" : "پیش‌نویس"}
                </p>
              </div>
              <Switch
                checked={formPublished}
                onCheckedChange={setFormPublished}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditingEvent(null); }}>
              انصراف
            </Button>
            <Button onClick={handleSubmit} disabled={formBusy} loading={formBusy}>
              {formBusy ? "در حال ذخیره..." : editingEvent ? "ذخیره تغییرات" : "ایجاد رویداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

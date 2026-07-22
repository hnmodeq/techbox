"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { moduleMeta, type ModuleSlug, getBySlug } from "@/lib/content";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCurrentUserClient } from "@/lib/auth";
import { ModuleBadge } from "@/components/ui/module-badge";
import { BlobUploadField } from "@/components/admin/BlobUploadField";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

async function getMe() {
  try {
    const r = await fetch("/api/auth/me", { cache: "no-store" });
    const j = await r.json();
    return j.user || getCurrentUserClient();
  } catch {
    return getCurrentUserClient();
  }
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function linesToArray(input: string) {
  return input.split("\n").map((x) => x.trim()).filter(Boolean);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function parseSpecs(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return Object.fromEntries(
      trimmed
        .split("\n")
        .map((line) => line.split(":"))
        .filter(([k, v]) => k?.trim() && v?.trim())
        .map(([k, ...rest]) => [k.trim(), rest.join(":").trim()])
    );
  }
}

const categoryHints: Record<ModuleSlug, string[]> = {
  blog: ["امنیت", "شبکه", "ذخیره‌سازی", "مجازی‌سازی", "مانیتورینگ"],
  news: ["زیرساخت", "امنیت", "شبکه", "سخت‌افزار", "هوش مصنوعی"],
  media: ["آموزش ویدیویی", "بررسی ویدیویی", "پادکست", "دموی عملی"],
  review: ["سرور", "شبکه", "ذخیره‌سازی", "امنیت", "برق و رک"],
  tools: ["شبکه", "ذخیره‌سازی", "ابزار"],
  download: ["سیستم‌عامل", "فریم‌ور", "درایور", "ابزار", "مانیتورینگ"],
  shop: ["سرور", "شبکه", "NAS", "امنیت", "برق و رک"],
  forum: ["پرسش", "شبکه", "امنیت", "بکاپ", "مانیتورینگ"],
  timeline: ["تاریخچه", "رویداد", "معماری", "سخت‌افزار", "نرم‌افزار"],
};

const postSchema = z.object({
  module: z.string().min(1),
  category: z.string().max(100).optional(),
  title: z.string().min(3, "عنوان حداقل ۳ کاراکتر").max(300),
  slug: z.string().max(120).optional(),
  excerpt: z.string().max(500).optional(),
  tags: z.string().max(500).optional(),
  image: z.string().max(1000).optional(),
  content: z.string().max(20000).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  videoUrl: z.string().max(1000).optional(),
  videoDuration: z.string().max(20).optional(),
  videoMimeType: z.string().max(100).optional(),
  videoFileSize: z.string().max(100).optional(),
  gallery: z.string().max(2000).optional(),
  fileName: z.string().max(300).optional(),
  fileUrl: z.string().max(1000).optional(),
  fileSize: z.string().max(100).optional(),
  rating: z.string().max(10).optional(),
  ratingCount: z.string().max(10).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  sku: z.string().max(100).optional(),
  priceLabel: z.string().max(200).optional(),
  priceAmount: z.string().max(30).optional(),
  sourcePriceAmount: z.string().max(20).optional(),
  sourceCurrency: z.string().max(10).optional(),
  priceAdjustmentPercent: z.string().max(10).optional(),
  discountPercent: z.string().max(5).optional(),
  discountEndsAt: z.string().max(30).optional(),
  sellerBenefitPercent: z.string().max(10).optional(),
  availability: z.string().max(100).optional(),
  warranty: z.string().max(200).optional(),
  specs: z.string().max(5000).optional(),
  status: z.enum(["published", "review", "draft", "archived"]).default("published"),
  published: z.boolean().default(true),
});

type PostValues = z.infer<typeof postSchema>;

function NewPostInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const modParam = (sp.get("module") as ModuleSlug) || "blog";
  const editSlug = sp.get("edit");
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [lastDraftKey, setLastDraftKey] = useState("");
  const [currencyRates, setCurrencyRates] = useState({ USD: 189000, EUR: 200000, AED: 51500, global: 0 });

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setCurrencyRates({
          USD: parseFloat(d["currency.usd_rate"] || "189000"),
          EUR: parseFloat(d["currency.eur_rate"] || "200000"),
          AED: parseFloat(d["currency.aed_rate"] || "51500"),
          global: parseFloat(d["currency.global_adjustment_percent"] || "0"),
        });
      })
      .catch(() => {});
  }, []);

  const form = useForm<any>({
    resolver: zodResolver(postSchema as any),
    defaultValues: {
      module: modParam,
      category: "",
      title: "",
      slug: "",
      excerpt: "",
      tags: "",
      image: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      videoUrl: "",
      videoDuration: "",
      videoMimeType: "",
      videoFileSize: "",
      gallery: "",
      fileName: "",
      fileUrl: "",
      fileSize: "",
      rating: "",
      ratingCount: "",
      brand: "",
      model: "",
      sku: "",
      priceLabel: "",
      priceAmount: "",
      sourcePriceAmount: "",
      sourceCurrency: "USD",
      priceAdjustmentPercent: "0",
      discountPercent: "",
      discountEndsAt: "",
      sellerBenefitPercent: "35",
      availability: "",
      warranty: "",
      specs: "",
      status: "published",
      published: true,
    },
  });

  const moduleWatch = form.watch("module") as ModuleSlug;
  const titleWatch = form.watch("title");
  const tagsWatch = form.watch("tags");
  const excerptWatch = form.watch("excerpt");
  const contentWatch = form.watch("content");
  const imageWatch = form.watch("image");
  const statusWatch = form.watch("status");
  const publishedWatch = form.watch("published");
  const sourcePriceAmountWatch = form.watch("sourcePriceAmount");
  const sourceCurrencyWatch = form.watch("sourceCurrency");
  const priceAdjustmentPercentWatch = form.watch("priceAdjustmentPercent");
  const sellerBenefitPercentWatch = form.watch("sellerBenefitPercent");

  const parsedTags = useMemo(() => (tagsWatch || "").split(",").map((t: any) => t.trim()).filter(Boolean), [tagsWatch]);
  const resolvedSlug = (form.watch("slug") || "").trim() || slugify(titleWatch || "");

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadEdit() {
      if (!editSlug) return;
      let it: any = null;
      try {
        const res = await fetch(`/api/posts?module=${encodeURIComponent(moduleWatch)}&slug=${encodeURIComponent(editSlug)}`, { cache: "no-store" });
        if (res.ok) it = await res.json();
      } catch {}
      if (!it) it = getBySlug(moduleWatch, editSlug);
      if (!mounted || !it) return;
      form.reset({
        module: moduleWatch,
        title: it.title || "",
        slug: it.slug || "",
        excerpt: it.excerpt || "",
        category: it.category || "",
        tags: (it.tags || []).join(", "),
        content: it.content || "",
        image: it.image || "",
        published: typeof it.published === "boolean" ? it.published : true,
        status: it.status || (it.published ? "published" : "draft"),
        videoUrl: it.videoUrl || "",
        videoDuration: it.videoDuration || "",
        videoMimeType: it.videoMimeType || "",
        videoFileSize: it.videoFileSize || "",
        gallery: (it.gallery || []).join("\n"),
        fileName: it.fileName || "",
        fileUrl: it.fileUrl || "",
        fileSize: it.fileSize || "",
        rating: typeof it.rating === "number" ? String(it.rating) : "",
        ratingCount: typeof it.ratingCount === "number" ? String(it.ratingCount) : "",
        seoTitle: it.seoTitle || "",
        seoDescription: it.seoDescription || "",
        brand: it.brand || "",
        model: it.model || "",
        sku: it.sku || "",
        priceLabel: it.priceLabel || "",
        priceAmount: it.priceAmount ? String(it.priceAmount) : "",
        sourcePriceAmount: (it as any).sourcePriceAmount ? String((it as any).sourcePriceAmount) : "",
        sourceCurrency: (it as any).sourceCurrency || "USD",
        priceAdjustmentPercent: (it as any).priceAdjustmentPercent ? String((it as any).priceAdjustmentPercent) : "0",
        discountPercent: it.discountPercent ? String(it.discountPercent) : "",
        discountEndsAt: it.discountEndsAt ? new Date(it.discountEndsAt).toISOString().slice(0, 16) : "",
        sellerBenefitPercent: (it as any).sellerBenefitPercent || "35",
        availability: it.availability || "",
        warranty: it.warranty || "",
        specs: it.specs ? JSON.stringify(it.specs, null, 2) : "",
      });
    }
    loadEdit();
    return () => {
      mounted = false;
    };
  }, [editSlug, moduleWatch, form]);

  if (!user)
    return (
      <main className="p-10 text-center" dir="rtl">
        ابتدا{" "}
        <Link className="text-primary underline" href="/admin/login">
          وارد شوید
        </Link>
      </main>
    );

  const canEdit = user.role === "super_admin" || (user.modules || []).includes(moduleWatch);
  if (!canEdit)
    return (
      <main className="p-10 text-center text-destructive" dir="rtl">
        دسترسی به ماژول {moduleMeta[moduleWatch]?.titleFa} ندارید.
      </main>
    );

  const allowed: ModuleSlug[] = user.role === "super_admin" ? (Object.keys(moduleMeta) as ModuleSlug[]) : user.modules || [];

  const onSubmit = async (values: PostValues) => {
    if (!values.title.trim()) {
      setMsg("عنوان الزامی است");
      return;
    }
    setSaving(true);
    setMsg("");
    setLastDraftKey("");
    const payload = {
      module: values.module,
      slug: (values.slug || "").trim() || slugify(values.title),
      title: values.title.trim(),
      excerpt: (values.excerpt || "").trim(),
      content: (values.content || "").trim(),
      image: (values.image || "").trim() || undefined,
      published: values.published,
      status: values.status,
      videoUrl: (values.videoUrl || "").trim() || undefined,
      videoDuration: (values.videoDuration || "").trim() || undefined,
      videoMimeType: (values.videoMimeType || "").trim() || undefined,
      videoFileSize: (values.videoFileSize || "").trim() || undefined,
      gallery: linesToArray(values.gallery || ""),
      tags: parsedTags,
      category: (values.category || "").trim() || undefined,
      rating: (values.rating || "").trim() ? Number(values.rating) : undefined,
      ratingCount: (values.ratingCount || "").trim() ? Number(values.ratingCount) : undefined,
      fileName: (values.fileName || "").trim() || undefined,
      fileUrl: (values.fileUrl || "").trim() || undefined,
      fileSize: (values.fileSize || "").trim() || undefined,
      seoTitle: (values.seoTitle || "").trim() || undefined,
      seoDescription: (values.seoDescription || "").trim() || undefined,
      brand: (values.brand || "").trim() || undefined,
      model: (values.model || "").trim() || undefined,
      sku: (values.sku || "").trim() || undefined,
      priceLabel: (values.priceLabel || "").trim() || undefined,
      priceAmount: (values.priceAmount || "").trim() ? Number(values.priceAmount) : undefined,
      sourcePriceAmount: (values as any).sourcePriceAmount ? Number((values as any).sourcePriceAmount) : undefined,
      sourceCurrency: (values as any).sourceCurrency || "USD",
      priceAdjustmentPercent: (values as any).priceAdjustmentPercent ? Number((values as any).priceAdjustmentPercent) : 0,
      discountPercent: (values.discountPercent || "").trim() ? Number(values.discountPercent) : undefined,
      discountEndsAt: (values.discountEndsAt || "").trim() ? new Date(values.discountEndsAt!).toISOString() : undefined,
      sellerBenefitPercent: (values as any).sellerBenefitPercent ? String((values as any).sellerBenefitPercent) : "35",
      availability: (values.availability || "").trim() || undefined,
      warranty: (values.warranty || "").trim() || undefined,
      specs: parseSpecs(values.specs || ""),
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save_failed");
      setMsg("منتشر شد ✓ در حال انتقال به لیست محتوا…");
      toast.success("منتشر شد");
      setTimeout(() => router.push(`/admin/posts?module=${values.module}`), 650);
    } catch (err: any) {
      const key = `tb_drafts_${values.module}`;
      const drafts = JSON.parse(localStorage.getItem(key) || "[]");
      const draft = {
        ...payload,
        savedAt: new Date().toISOString(),
        savedAtFa: new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
        apiError: err.message,
      };
      drafts.unshift(draft);
      localStorage.setItem(key, JSON.stringify(drafts.slice(0, 30)));
      setLastDraftKey(key);
      setMsg("API در دسترس نبود؛ پیش‌نویس امن در مرورگر ذخیره شد.");
      toast.error("API در دسترس نبود — پیش‌نویس ذخیره شد");
    } finally {
      setSaving(false);
    }
  };

  const isSuccess = msg.includes("✓");
  const isDraft = msg.includes("پیش‌نویس");
  const statusClass = isSuccess ? "text-green-600" : isDraft ? "text-amber-600" : "text-muted-foreground";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" dir="rtl">
      <Toaster dir="rtl" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ModuleBadge module={moduleWatch as ModuleSlug}>{moduleMeta[moduleWatch as ModuleSlug]?.titleFa}</ModuleBadge>
            {editSlug && <Badge variant="outline">حالت ویرایش</Badge>}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{editSlug ? "ویرایش مطلب" : "مطلب جدید"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.name} • {user.role === "super_admin" ? "مدیر کل" : "ویراستار"}
          </p>
        </div>
        <ButtonLink href={`/admin/posts?module=${moduleWatch}`} variant="ghost" size="sm">
          بازگشت به مدیریت محتوا
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <Card className="p-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control as any}
                  name="module"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ماژول *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowed.map((m) => (
                            <SelectItem key={m} value={m}>
                              {moduleMeta[m]?.titleFa} – /{m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>دسته‌بندی</FormLabel>
                      <FormControl>
                        <Input list="category-hints" placeholder="مثلا امنیت، شبکه…" {...field} />
                      </FormControl>
                      <datalist id="category-hints">
                        {categoryHints[moduleWatch as ModuleSlug]?.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان *</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان مطلب" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <FormField
                  control={form.control as any}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسلاگ</FormLabel>
                      <FormControl>
                        <Input placeholder="auto از عنوان" dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => form.setValue("slug", slugify(titleWatch || ""))} disabled={!titleWatch?.trim()}>
                  ساخت اسلاگ
                </Button>
              </div>

              <FormField
                control={form.control as any}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>خلاصه</FormLabel>
                    <FormControl>
                      <Textarea placeholder="خلاصه کوتاه برای کارت‌ها، فیدها و سئو…" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control as any}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>برچسب‌ها – با , جدا کنید</FormLabel>
                        <FormControl>
                          <Input placeholder="QNAP-2277, nas, storage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control as any}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تصویر شاخص URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." dir="ltr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <BlobUploadField
                label="آپلود تصویر شاخص"
                kind="image"
                folder={moduleWatch === "review" ? "review-images" : moduleWatch === "news" ? "news-images" : "article-images"}
                accept="image/*"
                onUploaded={(r) => form.setValue("image", r.url)}
              />
            </Card>

            <Accordion className="w-full space-y-4">
              <AccordionItem value="seo">
                <Card className="p-0">
                  <AccordionTrigger className="p-4">
                    <span className="font-bold">سئو و متادیتا</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <FormField
                        control={form.control as any}
                        name="seoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SEO Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="seoDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SEO Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {moduleWatch === "media" && (
                <AccordionItem value="media">
                  <Card className="p-0">
                    <AccordionTrigger className="p-4">ویدیو</AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-3">
                      <FormField
                        control={form.control as any}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input dir="ltr" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-3 md:grid-cols-3">
                        <FormField control={form.control as any} name="videoDuration" render={({ field }) => (
                          <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="08:35" dir="ltr" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control as any} name="videoMimeType" render={({ field }) => (
                          <FormItem><FormLabel>MIME</FormLabel><FormControl><Input placeholder="video/mp4" dir="ltr" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control as any} name="videoFileSize" render={({ field }) => (
                          <FormItem><FormLabel>Size</FormLabel><FormControl><Input placeholder="50 MB" dir="ltr" {...field} /></FormControl></FormItem>
                        )} />
                      </div>
                      <BlobUploadField
                        label="آپلود ویدیو"
                        kind="video"
                        folder="videos"
                        accept="video/mp4,video/webm,video/quicktime"
                        onUploaded={(r) => {
                          form.setValue("videoUrl", r.url);
                          form.setValue("videoMimeType", r.contentType);
                          form.setValue("videoFileSize", formatBytes(r.size));
                        }}
                      />
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

              {moduleWatch === "download" && (
                <AccordionItem value="download">
                  <Card className="p-0">
                    <AccordionTrigger className="p-4">فایل دانلود</AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <FormField control={form.control as any} name="fileName" render={({ field }) => (<FormItem><FormLabel>File Name</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control as any} name="fileSize" render={({ field }) => (<FormItem><FormLabel>File Size</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control as any} name="fileUrl" render={({ field }) => (<FormItem><FormLabel>File URL</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl></FormItem>)} />
                      </div>
                      <BlobUploadField label="آپلود فایل" kind="download" folder="archive/uploads" onUploaded={(r) => { form.setValue("fileUrl", r.url); form.setValue("fileName", r.fileName); form.setValue("fileSize", formatBytes(r.size)); }} />
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

              {moduleWatch === "review" && (
                <AccordionItem value="review">
                  <Card className="p-0">
                    <AccordionTrigger className="p-4">امتیاز</AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 grid gap-3 md:grid-cols-2">
                      <FormField control={form.control as any} name="rating" render={({ field }) => (<FormItem><FormLabel>Rating</FormLabel><FormControl><Input type="number" min="0" max="5" step="0.1" {...field} /></FormControl></FormItem>)} />
                      <FormField control={form.control as any} name="ratingCount" render={({ field }) => (<FormItem><FormLabel>Rating Count</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl></FormItem>)} />
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

              {moduleWatch === "shop" && (
                <AccordionItem value="shop">
                  <Card className="p-0">
                    <AccordionTrigger className="p-4">🛒 اطلاعات فروشگاه</AccordionTrigger>
                    <AccordionContent className="p-4 pt-0 space-y-5">

                      {/* Brand / Model / SKU */}
                      <div className="grid gap-3 md:grid-cols-3">
                        <FormField control={form.control as any} name="brand" render={({ field }) => (
                          <FormItem>
                            <FormLabel>برند</FormLabel>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <SelectTrigger><SelectValue placeholder="انتخاب برند…" /></SelectTrigger>
                              <SelectContent>
                                {["Dell","HPE","QNAP","Synology","Cisco","Fortinet","MikroTik","Huawei","Aruba","Juniper","Palo Alto","Netgear","سایر"].map((b) => (
                                  <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control as any} name="model" render={({ field }) => (
                          <FormItem><FormLabel>مدل</FormLabel><FormControl><Input placeholder="PowerEdge R750xs" dir="ltr" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control as any} name="sku" render={({ field }) => (
                          <FormItem><FormLabel>کد محصول (SKU)</FormLabel><FormControl><Input dir="ltr" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <Separator />

                      {/* Availability + Warranty */}
                      <div className="grid gap-3 md:grid-cols-2">
                        <FormField control={form.control as any} name="availability" render={({ field }) => (
                          <FormItem>
                            <FormLabel>وضعیت موجودی</FormLabel>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <SelectTrigger><SelectValue placeholder="انتخاب…" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="موجود برای مشاوره">✅ موجود برای مشاوره</SelectItem>
                                <SelectItem value="موجود">✅ موجود</SelectItem>
                                <SelectItem value="ناموجود">❌ ناموجود</SelectItem>
                                <SelectItem value="اتمام موجودی">⚠️ اتمام موجودی</SelectItem>
                                <SelectItem value="پیش‌سفارش">📦 پیش‌سفارش</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control as any} name="warranty" render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع گارانتی</FormLabel>
                            <Select value={field.value || ""} onValueChange={field.onChange}>
                              <SelectTrigger><SelectValue placeholder="انتخاب…" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">بدون گارانتی</SelectItem>
                                <SelectItem value="هونامیک ارتباط رستاک">هونامیک ارتباط رستاک</SelectItem>
                                <SelectItem value="گارانتی اصالت و سلامت محصول">گارانتی اصالت و سلامت محصول</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <Separator />

                      {/* Pricing – New dual-price system */}
                      <div className="space-y-5">
                        <div>
                          <p className="text-sm font-semibold mb-1">قیمت‌گذاری دو مرحله‌ای (ارز مبدا → تومان)</p>
                          <p className="text-[11px] text-muted-foreground mb-3">
                            قیمت مبدا (USD/EUR/AED) فقط در ادمین قابل مشاهده است. قیمت نهایی تومان = قیمت مبدا × نرخ روز ارز × (1+تعدیل جهانی%) × (1+تعدیل محصول%). نرخ ارز و تعدیل جهانی در صفحه تنظیمات سایت مدیریت می‌شود.
                          </p>
                          <div className="grid gap-3 md:grid-cols-3">
                            <FormField control={form.control as any} name="sourcePriceAmount" render={({ field }) => (
                              <FormItem>
                                <FormLabel>قیمت مبدا (پنهان – فقط ادمین)</FormLabel>
                                <FormControl><Input type="number" dir="ltr" placeholder="1000" {...field} /></FormControl>
                                <FormDescription className="text-[11px]">مثلاً 1000 دلار – از QNAP پر شده</FormDescription>
                              </FormItem>
                            )} />
                            <FormField control={form.control as any} name="sourceCurrency" render={({ field }) => (
                              <FormItem>
                                <FormLabel>واحد ارز مبدا</FormLabel>
                                <Select value={field.value || "USD"} onValueChange={field.onChange}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USD">USD – دلار آمریکا (پیش‌فرض)</SelectItem>
                                    <SelectItem value="EUR">EUR – یورو</SelectItem>
                                    <SelectItem value="AED">AED – درهم امارات</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-[11px]">پیش‌فرض USD، در صورت یورو/درهم تغییر دهید</FormDescription>
                              </FormItem>
                            )} />
                            <FormField control={form.control as any} name="priceAdjustmentPercent" render={({ field }) => (
                              <FormItem>
                                <FormLabel>تعدیل این محصول (%) – {field.value || "0"}%</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px]">-۵۰٪</span>
                                    <input type="range" min={-50} max={100} step={1} value={parseFloat(field.value || "0")} onChange={(e) => field.onChange(e.target.value)} className="flex-1" />
                                    <span className="text-[10px]">+۱۰۰٪</span>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-[11px]">افزایش/کاهش قیمت فقط این محصول نسبت به نرخ محاسبه شده</FormDescription>
                              </FormItem>
                            )} />
                            <FormField control={form.control as any} name="sellerBenefitPercent" render={({ field }) => (
                              <FormItem>
                                <FormLabel>سود فروشنده (سود شرکت) (%) – {field.value || "35"}%</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px]">۰٪</span>
                                    <input type="range" min={0} max={100} step={1} value={parseFloat(field.value || "35")} onChange={(e) => field.onChange(e.target.value)} className="flex-1" />
                                    <span className="text-[10px]">۱۰۰٪</span>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-[11px]">سود فروشنده بر اساس قیمت نهایی محاسبه شده (پیش‌فرض ۳۵٪)</FormDescription>
                              </FormItem>
                            )} />
                          </div>
                          <div className="mt-3 rounded-md bg-muted/40 p-3 text-[11px] leading-5 space-y-2">
                            <p className="font-bold">محاسبه زنده نهایی تومان (قابل مشاهده در فرانت):</p>
                            <p dir="ltr" className="font-mono text-[11px]">Final = Source × Rate × (1+Global%) × (1+Product%) × (1+SellerBenefit%)</p>
                            {(() => {
                              const src = parseFloat((sourcePriceAmountWatch as string) || "0");
                              const curr = (sourceCurrencyWatch as string) || "USD";
                              const prodAdj = parseFloat((priceAdjustmentPercentWatch as string) || "0");
                              const sellerBenefit = parseFloat((sellerBenefitPercentWatch as string) || "35");
                              const rate = curr === "EUR" ? currencyRates.EUR : curr === "AED" ? currencyRates.AED : currencyRates.USD;
                              const base = src * rate;
                              const afterGlobal = base * (1 + currencyRates.global / 100);
                              const afterProduct = afterGlobal * (1 + prodAdj / 100);
                              const final = afterProduct * (1 + sellerBenefit / 100);
                              if (!src) return <p className="text-muted-foreground">قیمت مبدا را وارد کنید تا قیمت نهایی محاسبه شود</p>;
                              return (
                                <div className="space-y-1">
                                  <p>نرخ {curr}: {rate.toLocaleString("fa-IR")} تومان (از تنظیمات → قیمت و ارز)</p>
                                  <p>پایه: {src.toLocaleString("fa-IR")} {curr} × {rate.toLocaleString("fa-IR")} = {base.toLocaleString("fa-IR")} تومان</p>
                                  <p>پس از تعدیل جهانی {currencyRates.global}%: {afterGlobal.toLocaleString("fa-IR")} تومان</p>
                                  <p>پس از تعدیل محصول {prodAdj}%: {afterProduct.toLocaleString("fa-IR")} تومان</p>
                                  <p>پس از سود فروشنده {sellerBenefit}%: {final.toLocaleString("fa-IR")} تومان</p>
                                  <p className="font-bold text-[12px] text-primary">قیمت نهایی نمایش به کاربر: {final.toLocaleString("fa-IR")} تومان</p>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-sm font-semibold mb-3">قیمت نهایی و تخفیف (قابل override دستی)</p>
                          <div className="grid gap-3 md:grid-cols-3">
                            <FormField control={form.control as any} name="priceAmount" render={({ field }) => (
                              <FormItem>
                                <FormLabel>قیمت نهایی دستی (تومان) – اختیاری</FormLabel>
                                <FormControl><Input type="number" dir="ltr" placeholder="مثلاً 189000000 (خالی = محاسبه خودکار)" {...field} /></FormControl>
                                <FormDescription className="text-[11px]">اگر خالی باشد، از فرمول بالا محاسبه می‌شود. اگر پر کنید، override می‌شود.</FormDescription>
                              </FormItem>
                            )} />
                            <FormField control={form.control as any} name="discountPercent" render={({ field }) => (
                              <FormItem>
                                <FormLabel>درصد تخفیف (۰-۹۹)</FormLabel>
                                <FormControl><Input type="number" min="0" max="99" dir="ltr" placeholder="15" {...field} /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control as any} name="discountEndsAt" render={({ field }) => (
                              <FormItem>
                                <FormLabel>پایان تخفیف</FormLabel>
                                <FormControl><Input type="datetime-local" dir="ltr" {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      </div>

                      <Separator />
                      <div className="space-y-4">
                        <p className="text-sm font-semibold mb-1">مشخصات فنی (۱۸ مورد مهم – فارسی)</p>
                        <p className="text-[11px] text-muted-foreground mb-3">تمام مشخصات فنی اصلی از همین لیست پر می‌شوند و مستقیماً به پایگاه داده متصل هستند. ۴ مشخصه مهم روی کارت محصول نمایش داده می‌شوند.</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {/* CPU – text */}
                          {(() => {
                            const key = "CPU";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">CPU / پردازنده (مهم – روی کارت)</label>
                                <Input dir="ltr" placeholder="Intel Xeon D-2123IT 4-core 3.0GHz" className="mt-1" value={specsObj[key] || ""} onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }} />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "RAM";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">RAM / حافظه (مهم – روی کارت)</label>
                                <Input dir="ltr" placeholder="32GB DDR4 ECC" className="mt-1" value={specsObj[key] || ""} onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }} />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "Bay";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            const selectedVal = specsObj[key] || "";
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">Bay / تعداد جایگاه دیسک (مهم – روی کارت + فیلتر)</label>
                                <Select value={selectedVal} onValueChange={(v) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (v) obj[key] = v; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }}>
                                  <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب تعداد Bay..." /></SelectTrigger>
                                  <SelectContent>
                                    {["1 Bay", "2 Bay", "4 Bay", "6 Bay", "8 Bay", "12 Bay", "16 Bay", "24 Bay", "36 Bay"].map((b) => (
                                      <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "Network Card";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            const selectedVal = specsObj[key] || "";
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">تعداد جایگاه دیسک (مهم – روی کارت + فیلتر)</label>
                                <Select value={selectedVal} onValueChange={(v) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (v) obj[key] = v; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }}>
                                  <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                                  <SelectContent>
                                    {["1GbE", "2.5GbE", "10GbE", "25GbE", "40GbE", "10GbE SFP+", "25GbE SFP28"].map((b) => (
                                      <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "Form Factor";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">سازگاری درایو</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="3.5&quot; / 2.5&quot; SATA / SAS / NVMe" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "اسلات M.2";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">اسلات M.2</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="2x M.2 NVMe" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "پورت 2.5 گیگ";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            const selectedVal = specsObj[key] || "";
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">پورت 2.5 گیگابیت (مهم – روی کارت + فیلتر)</label>
                                <Select value={selectedVal} onValueChange={(v) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (v) obj[key] = v; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }}>
                                  <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                                  <SelectContent>
                                    {["Tower", "Desktop", "Rackmount 1U", "Rackmount 2U", "Rackmount 3U", "Rackmount 4U", "Short-depth 1U", "Short-depth 2U"].map((b) => (
                                      <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "اسلات توسعه PCIe";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">اسلات توسعه PCIe</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="2x PCIe 4.0 x8" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "فرم فاکتور";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            const selectedVal = specsObj[key] || "";
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">فرم فاکتور</label>
                                <Select value={selectedVal} onValueChange={(v) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (v) obj[key] = v; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }}>
                                  <SelectTrigger className="mt-1"><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem key="Tower" value="Tower">Tower</SelectItem>
                                    <SelectItem key="Desktop" value="Desktop">Desktop</SelectItem>
                                    <SelectItem key="Rackmount 1U" value="Rackmount 1U">Rackmount 1U</SelectItem>
                                    <SelectItem key="Rackmount 2U" value="Rackmount 2U">Rackmount 2U</SelectItem>
                                    <SelectItem key="Rackmount 3U" value="Rackmount 3U">Rackmount 3U</SelectItem>
                                    <SelectItem key="Rackmount 4U" value="Rackmount 4U">Rackmount 4U</SelectItem>
                                    <SelectItem key="Short-depth 1U" value="Short-depth 1U">Short-depth 1U</SelectItem>
                                    <SelectItem key="Short-depth 2U" value="Short-depth 2U">Short-depth 2U</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "منبع تغذیه";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">منبع تغذیه</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="750W Redundant" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "مصرف برق معمولی";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">مصرف برق معمولی</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="350W" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "گارانتی استاندارد";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">گارانتی استاندارد</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="۳۶ ماه" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "فن";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">فن</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="4x Hot-swap 40mm" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "سیستم عامل";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">سیستم عامل</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="DSM / QTS / TrueNAS" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "انواع RAID پشتیبانی شده";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">انواع RAID پشتیبانی شده</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="RAID 0,1,5,6,10" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "حداکثر ظرفیت Pool";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">حداکثر ظرفیت Pool</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="200TB" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "نوع Volume";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">نوع Volume</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="Thick / Thin / Hybrid" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "حداکثر اتصالات همزمان";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">حداکثر اتصالات همزمان</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="500" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {(() => {
                            const key = "حداکثر ظرفیت Volume";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            return (
                              <div key={key}>
                                <label className="text-xs font-medium text-muted-foreground">حداکثر ظرفیت Volume</label>
                                <Input dir="ltr" className="mt-1" value={specsObj[key] || ""} placeholder="108TB" onChange={(e) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (e.target.value.trim()) obj[key] = e.target.value; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); } } />
                              </div>
                            );
                          })()}
                          {/* Fast shipping toggle */}
                          {(() => {
                            const key = "ارسال سریع";
                            const specsStr: string = (form.watch("specs") as string) || "{}";
                            let specsObj: Record<string, string> = {};
                            try { specsObj = JSON.parse(specsStr); } catch {}
                            const isFast = specsObj[key] === "دارد";
                            return (
                              <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                  <div className="text-xs font-medium">ارسال سریع</div>
                                  <div className="text-[11px] text-muted-foreground">آیا این محصول ارسال سریع دارد؟</div>
                                </div>
                                <Switch checked={isFast} onCheckedChange={(checked) => { let obj: Record<string, string> = {}; try { obj = JSON.parse(specsStr); } catch {} if (checked) obj[key] = "دارد"; else delete obj[key]; form.setValue("specs", JSON.stringify(obj, null, 2)); }} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-4">
                          <p className="text-xs font-medium mb-2">JSON خام Specs (۱۸ مورد مهم – قابل ویرایش مستقیم)</p>
                          <FormField control={form.control as any} name="specs" render={({ field }) => (
                            <FormItem>
                              <FormControl><Textarea className="min-h-[120px] font-mono text-[11px]" dir="ltr" {...field} /></FormControl>
                              <FormDescription className="text-[11px]">کلیدهای فارسی دسته‌بندی شده در مشخصات فنی نمایش داده می‌شوند. ۴ مورد اول روی کارت محصول می‌آیند.</FormDescription>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <Separator />

                      {/* Images */}
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">تصاویر محصول</p>
                        <BlobUploadField label="آپلود تصویر اصلی" kind="image" folder="products" accept="image/*"
                          onUploaded={(r) => form.setValue("image", r.url)} />
                        <BlobUploadField label="افزودن به گالری" kind="image" folder="products" accept="image/*"
                          onUploaded={(r) => form.setValue("gallery", [form.getValues("gallery")?.trim(), r.url].filter(Boolean).join("\n"))} />
                        <FormField control={form.control as any} name="gallery" render={({ field }) => (
                          <FormItem>
                            <FormLabel>URLهای گالری (هر خط یک URL)</FormLabel>
                            <FormControl><Textarea className="min-h-[70px]" dir="ltr" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>

                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}
            </Accordion>

            <Card className="p-5 space-y-4">
              <FormField
                control={form.control as any}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتوا</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[260px]" placeholder="متن کامل / HTML / Markdown…" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <FormField
                  control={form.control as any}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وضعیت انتشار</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="published">منتشر شده</SelectItem>
                          <SelectItem value="review">در حال بررسی</SelectItem>
                          <SelectItem value="draft">پیش‌نویس</SelectItem>
                          <SelectItem value="archived">آرشیو شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>انتشار عمومی</FormLabel>
                        <FormDescription>{field.value ? "قابل مشاهده برای عموم" : "ذخیره به‌عنوان پیش‌نویس"}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className={`text-sm ${statusClass}`}>
                  {msg || "POST → /api/posts – RBAC server-side؛ در خطا، پیش‌نویس لوکال ذخیره می‌شود."}
                  {lastDraftKey && <span className="block text-xs">کلید پیش‌نویس: <code>{lastDraftKey}</code></span>}
                </div>
                <div className="flex gap-2">
                  <ButtonLink href={`/admin/posts?module=${moduleWatch}`} variant="ghost" size="sm">انصراف</ButtonLink>
                  <Button size="sm" disabled={saving || !titleWatch?.trim()} type="submit" loading={saving}>
                    {saving ? "در حال ذخیره…" : editSlug ? "ذخیره تغییرات" : publishedWatch ? "انتشار" : "ذخیره پیش‌نویس"}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </Form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-4">
            <h2 className="text-sm font-bold">پیش‌نمایش منبع</h2>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div>مسیر: <code dir="ltr">/{moduleWatch}/{resolvedSlug || "slug"}</code></div>
              <div>دسته: {form.watch("category") || "—"}</div>
              <div>برچسب‌ها: {parsedTags.length.toLocaleString("fa-IR")}</div>
              <div>خلاصه: {(excerptWatch || "").length.toLocaleString("fa-IR")} کاراکتر</div>
              <div>محتوا: {(contentWatch || "").length.toLocaleString("fa-IR")} کاراکتر</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {parsedTags.slice(0, 8).map((t: any) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
              {parsedTags.length > 8 && <Badge variant="secondary">+{(parsedTags.length - 8).toLocaleString("fa-IR")}</Badge>}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            {imageWatch && (
              <div className="relative aspect-[16/9] bg-muted">
                <Image src={imageWatch} alt="preview" fill sizes="320px" className="object-cover" />
              </div>
            )}
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <ModuleBadge module={moduleWatch as ModuleSlug}>{moduleMeta[moduleWatch as ModuleSlug]?.titleFa}</ModuleBadge>
                <Badge variant={statusWatch === "published" ? "default" : statusWatch === "review" ? "secondary" : statusWatch === "archived" ? "destructive" : "outline"}>
                  {statusWatch}
                </Badge>
              </div>
              <h3 className="font-black line-clamp-2">{titleWatch || "عنوان مطلب"}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3">{excerptWatch || "خلاصه مطلب اینجا دیده می‌شود."}</p>
            </CardContent>
          </Card>

          <Card className="p-4 text-xs text-muted-foreground">
            <b className="text-foreground">راهنمای CMS</b>
            <br />• اسلاگ اگر خالی باشد از عنوان ساخته می‌شود.
            <br />• برچسب‌های فارسی/انگلیسی باعث بهتر شدن جستجو و مطالب مرتبط می‌شوند.
            <br />• اگر API/Prisma آماده نباشد، پیش‌نویس در مرورگر ذخیره می‌شود.
          </Card>
        </aside>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        دسترسی شما:{" "}
        <span className="mx-1 inline-flex flex-wrap justify-center gap-1 align-middle">
          {allowed.map((m) => (
            <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa}</ModuleBadge>
          ))}
        </span>
      </p>
    </main>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری…</div>}>
      <NewPostInner />
    </Suspense>
  );
}

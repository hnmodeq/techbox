"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TerminalHero } from "@/components/effects/TerminalHero";
import { PlusIcon, TrashIcon, RefreshCw, Shuffle } from "lucide-react";

export default function HeroTerminalAdminPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <HeroTerminalContent />}
    </AdminGuard>
  );
}

function HeroTerminalContent() {
  const [echoLines, setEchoLines] = useState<string[]>([]);
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [echoEnabled, setEchoEnabled] = useState(true);
  const [codeEnabled, setCodeEnabled] = useState(true);
  const [echoWeight, setEchoWeight] = useState(70);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"echo" | "code" | "preview">("preview");

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/hero-terminal", { cache: "no-store" });
      const data = await res.json();
      setEchoLines(data.echoLines || []);
      setCodeLines(data.codeLines || []);
      setEchoEnabled(data.echoEnabled !== false);
      setCodeEnabled(data.codeEnabled !== false);
      setEchoWeight(data.echoWeight || 70);
    } catch {} finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/hero-terminal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ echoLines, codeLines, echoEnabled, codeEnabled, echoWeight }),
      });
      if (res.ok) toast.success("تنظیمات ذخیره شد");
      else toast.error("خطا در ذخیره");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setBusy(false);
    }
  };

  const addLine = (list: "echo" | "code") => {
    if (list === "echo") setEchoLines((p) => [...p, ""]);
    else setCodeLines((p) => [...p, ""]);
  };
  const removeLine = (list: "echo" | "code", i: number) => {
    if (list === "echo") setEchoLines((p) => p.filter((_, idx) => idx !== i));
    else setCodeLines((p) => p.filter((_, idx) => idx !== i));
  };
  const updateLine = (list: "echo" | "code", i: number, val: string) => {
    if (list === "echo") setEchoLines((p) => p.map((l, idx) => (idx === i ? val : l)));
    else setCodeLines((p) => p.map((l, idx) => (idx === i ? val : l)));
  };

  const activeCount = (echoEnabled ? echoLines.length : 0) + (codeEnabled ? codeLines.length : 0);

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="text-2xl">⌨️</span>
            ترمینال هیرو
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مدیریت عبارات ترمینال صفحه اصلی — {activeCount.toLocaleString("fa-IR")} عبارت فعال
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="size-3" />
          </Button>
          <Button size="sm" onClick={save} disabled={busy} loading={busy}>
            {busy ? "..." : "ذخیره"}
          </Button>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">تنظیمات انتخاب تصادفی</CardTitle>
          <CardDescription>
            ترمینال هر بار ۵ تا ۱۲ عبارت تصادفی تایپ می‌کند. عبارات shuffle شده و ترتیب هیچ‌وقت تکرار نمی‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <Label className="text-sm font-bold">Echo (سرگرمی)</Label>
                  <p className="text-[10px] text-muted-foreground">{echoLines.length} عبارت</p>
                </div>
              </div>
              <Switch checked={echoEnabled} onCheckedChange={setEchoEnabled} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">💻</span>
                <div>
                  <Label className="text-sm font-bold">Code (برنامه‌نویسی)</Label>
                  <p className="text-[10px] text-muted-foreground">{codeLines.length} عبارت</p>
                </div>
              </div>
              <Switch checked={codeEnabled} onCheckedChange={setCodeEnabled} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">وزن انتخاب</Label>
              <span className="text-xs text-muted-foreground font-mono">
                Echo: {echoWeight}% · Code: {100 - echoWeight}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] w-8">Echo</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={echoWeight}
                onChange={(e) => setEchoWeight(parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <span className="text-[10px] w-8 text-left">Code</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="preview" className="gap-1.5">
            <Shuffle className="size-3.5" />
            پیش‌نمایش
          </TabsTrigger>
          <TabsTrigger value="echo" className="gap-1.5">
            💬 Echo ({echoLines.length})
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5">
            💻 Code ({codeLines.length})
          </TabsTrigger>
        </TabsList>

        {/* Preview */}
        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">پیش‌نمایش زنده</CardTitle>
              <CardDescription>عبارات به‌صورت تصادفی از هر لیست انتخاب و shuffle می‌شوند.</CardDescription>
            </CardHeader>
            <CardContent>
              <TerminalHero
                fullWidth
                echoLines={echoLines}
                codeLines={codeLines}
                echoEnabled={echoEnabled}
                codeEnabled={codeEnabled}
                echoWeight={echoWeight}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Echo List */}
        <TabsContent value="echo" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                💬 عبارات Echo (سرگرمی)
                <Badge variant="secondary">{echoLines.length}</Badge>
              </CardTitle>
              <CardDescription>عبارات خنده‌دار و سرگرم‌کننده. با echo شروع می‌شوند.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {fetching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
                </div>
              ) : (
                <>
                  {echoLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                      <Input
                        value={line}
                        onChange={(e) => updateLine("echo", i, e.target.value)}
                        placeholder={`echo "عبارت ${i + 1}"`}
                        className="flex-1 font-mono text-xs"
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeLine("echo", i)}
                        className="shrink-0 text-destructive"
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                  {echoLines.length < 100 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => addLine("echo")} className="gap-1.5 w-full">
                      <PlusIcon className="size-3" /> افزودن
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code List */}
        <TabsContent value="code" className="pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                💻 عبارات Code (برنامه‌نویسی)
                <Badge variant="secondary">{codeLines.length}</Badge>
              </CardTitle>
              <CardDescription>دستورات واقعی ترمینال. ssh، curl، docker، git و غیره.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {fetching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
                </div>
              ) : (
                <>
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-6 text-center shrink-0">{i + 1}</span>
                      <Input
                        value={line}
                        onChange={(e) => updateLine("code", i, e.target.value)}
                        placeholder="ssh user@host ..."
                        className="flex-1 font-mono text-xs"
                        dir="ltr"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeLine("code", i)}
                        className="shrink-0 text-destructive"
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    </div>
                  ))}
                  {codeLines.length < 50 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => addLine("code")} className="gap-1.5 w-full">
                      <PlusIcon className="size-3" /> افزودن
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

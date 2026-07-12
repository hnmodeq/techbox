"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Trash2, Send, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; time: number };

const STORAGE_KEY = "tb_chat_history";

// Rebuilt with shadcn: Button + Card + Input + ScrollArea + Badge + Separator
// FAB stays as shadcn Button rounded-full, panel as Card fixed bottom-left
// Placeholder for future Message + MessageScroller + Bubble components
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setMsgs(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", text, time: Date.now() };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...msgs, userMsg].slice(-12).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const reply = data?.reply || data?.error || "پاسخی دریافت نشد – کلید API را در .env تنظیم کنید: CHAT_API_KEY / CHAT_BASE_URL";
      setMsgs((m) => [...m, { role: "assistant", text: reply, time: Date.now() }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: "assistant", text: "خطا در اتصال به سرویس چت – حالت آفلاین.", time: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB — shadcn Button rounded-full */}
      {!open && (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          style={{ zIndex: zIndex.popover }}
          className="fixed bottom-5 left-5 rounded-full shadow-md gap-2 px-4 py-2.5 h-auto"
          aria-label="پشتیبانی تکباکس"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs sm:text-sm">پشتیبانی</span>
          <Badge variant="secondary" className="ms-1 text-[10px] px-1.5 py-0">
            <Sparkles className="size-3 me-0.5" />
            AI
          </Badge>
        </Button>
      )}

      {/* Panel — shadcn Card + ScrollArea */}
      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{ zIndex: zIndex.chatbot }}>
          <Card className="flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageCircle className="size-4" />
                </div>
                <CardTitle className="text-sm font-bold">پشتیبانی تکباکس</CardTitle>
                <Badge variant="outline" className="text-[10px]">آنلاین</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    setMsgs([]);
                    localStorage.removeItem(STORAGE_KEY);
                  }}
                  aria-label="پاک‌سازی"
                  title="پاک‌سازی تاریخچه"
                >
                  <Trash2 className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)} aria-label="بستن چت">
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 bg-muted/20">
              <CardContent className="p-3 space-y-3">
                {msgs.length === 0 && (
                  <div className="text-center py-8 space-y-2">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                      <Sparkles className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">سوال فنی یا محصول خود را بپرسید. چت‌بات با مدل {process.env.CHAT_MODEL || "AI"} پاسخ می‌دهد.</p>
                    <p className="text-[10px] text-muted-foreground">در آینده از Message + Bubble + MessageScroller استفاده خواهد شد.</p>
                  </div>
                )}
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-6 whitespace-pre-wrap shadow-sm ${
                        m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border bg-card px-3 py-2 text-xs text-muted-foreground">در حال فکر کردن…</div>
                  </div>
                )}
                <div ref={endRef} />
              </CardContent>
            </ScrollArea>

            <Separator />

            <CardFooter className="p-2">
              <form onSubmit={send} className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="سوال فنی / محصول خود را بپرسید…"
                  className="flex-1 h-8 text-xs"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !input.trim()} size="sm" className="px-3">
                  {loading ? "…" : <><Send className="size-3.5 me-1" /> ارسال</>}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, X, Trash2, Send, Sparkles, LifeBuoy, Users } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; time: number };
type TabType = "chatbot" | "support" | "messenger";

const STORAGE_KEY = "tb_chat_history";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chatbot");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
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

  const renderTabContent = (tab: TabType) => {
    if (tab === "chatbot") {
      return (
        <>
          {msgs.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
                <Sparkles className="size-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">سوال فنی یا محصول خود را بپرسید. چت‌بات با مدل AI پاسخ می‌دهد.</p>
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
        </>
      );
    }

    if (tab === "support") {
      return (
        <div className="text-center py-8 space-y-2">
          <LifeBuoy className="mx-auto size-10 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">تیم پشتیبانی در ساعات اداری پاسخگوی شماست.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => window.location.href = '/support'}>
            ارسال پیام به پشتیبانی
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center py-8 space-y-2">
        <Users className="mx-auto size-10 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">پیام‌های خصوصی به زودی فعال می‌شود.</p>
      </div>
    );
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <Button
          type="button"
          onClick={() => { setOpen(true); setHasUnread(false); }}
          style={{ zIndex: zIndex.popover }}
          className="fixed bottom-5 left-5 rounded-full shadow-md gap-2 px-4 py-2.5 h-auto"
          aria-label="پشتیبانی تکباکس"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs sm:text-sm">پشتیبانی</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      )}

      {/* Panel */}
      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{ zIndex: zIndex.chatbot }}>
          <Card className="flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageCircle className="size-4" />
                </div>
                <CardTitle className="text-sm font-bold">پشتیبانی تکباکس</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)} aria-label="بستن چت">
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2">
                <TabsTrigger value="chatbot" className="gap-1 text-xs">
                  <Sparkles className="size-3" />
                  چت‌بات
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-1 text-xs">
                  <LifeBuoy className="size-3" />
                  پشتیبانی
                </TabsTrigger>
                <TabsTrigger value="messenger" className="gap-1 text-xs">
                  <Users className="size-3" />
                  پیام‌ها
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chatbot" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderTabContent("chatbot")}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="support" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderTabContent("support")}
                  </CardContent>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messenger" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderTabContent("messenger")}
                  </CardContent>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {activeTab === "chatbot" && (
              <>
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
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

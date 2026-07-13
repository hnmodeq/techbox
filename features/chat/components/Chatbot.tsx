"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, X, Send, Sparkles, LifeBuoy, Users } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string; time: number };
type TabType = "chatbot" | "support" | "messenger";

const STORAGE_KEY = "tb_chat_history";
const SUPPORT_STORAGE_KEY = "tb_support_chat_history";
const PERSONAL_STORAGE_KEY = "tb_personal_chat_history";

const supportWelcome: Msg = {
  role: "assistant",
  text: "سلام، به چت پشتیبانی تکباکس خوش آمدید. پیام‌تان را بنویسید؛ اولین عضو تیم پشتیبانی که آنلاین شود پاسخ می‌دهد.",
  time: Date.now(),
};

const personalWelcome: Msg = {
  role: "assistant",
  text: "پیام‌های شخصی شما اینجا نمایش داده می‌شود. فعلاً می‌توانید نمونه پیام خود را بنویسید تا ظاهر چت را ببینید.",
  time: Date.now(),
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chatbot");
  const [input, setInput] = useState("");
  const [supportInput, setSupportInput] = useState("");
  const [personalInput, setPersonalInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [supportMsgs, setSupportMsgs] = useState<Msg[]>([supportWelcome]);
  const [personalMsgs, setPersonalMsgs] = useState<Msg[]>([personalWelcome]);
  const [loading, setLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      const support = localStorage.getItem(SUPPORT_STORAGE_KEY);
      const personal = localStorage.getItem(PERSONAL_STORAGE_KEY);
      if (s) setMsgs(JSON.parse(s));
      if (support) setSupportMsgs(JSON.parse(support));
      if (personal) setPersonalMsgs(JSON.parse(personal));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(supportMsgs.slice(-40)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [supportMsgs]);

  useEffect(() => {
    localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(personalMsgs.slice(-40)));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [personalMsgs]);

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
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "خطا در اتصال به سرویس چت – حالت آفلاین.", time: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const sendSupport = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = supportInput.trim();
    if (!text || supportLoading) return;
    setSupportMsgs((m) => [...m, { role: "user", text, time: Date.now() }]);
    setSupportInput("");
    setSupportLoading(true);
    window.setTimeout(() => {
      setSupportMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "پیام شما برای تیم پشتیبانی ثبت شد. تا زمان اتصال سیستم زنده، پاسخ تیم در همین پنجره شبیه‌سازی می‌شود.",
          time: Date.now(),
        },
      ]);
      setSupportLoading(false);
    }, 700);
  };

  const sendPersonal = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = personalInput.trim();
    if (!text) return;
    setPersonalMsgs((m) => [...m, { role: "user", text, time: Date.now() }]);
    setPersonalInput("");
  };

  const renderMessages = (messages: Msg[], emptyText?: string, loadingText?: string) => (
    <>
      {messages.length === 0 && emptyText && (
        <div className="text-center py-8 space-y-2">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      )}
      {messages.map((m, i) => (
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
      {loadingText && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm border bg-card px-3 py-2 text-xs text-muted-foreground">{loadingText}</div>
        </div>
      )}
    </>
  );

  return (
    <>
      {!open && (
        <Button
          type="button"
          onClick={() => { setOpen(true); setHasUnread(false); }}
          style={{ zIndex: zIndex.popover }}
          className="fixed bottom-5 left-5 rounded-full shadow-md gap-2 px-4 py-2.5 h-auto"
          aria-label="چت‌های تکباکس"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs sm:text-sm">چت‌های تکباکس</span>
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      )}

      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{ zIndex: zIndex.chatbot }}>
          <Card className="flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MessageCircle className="size-4" />
                </div>
                <CardTitle className="text-sm font-bold">چت‌های تکباکس</CardTitle>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setOpen(false)} aria-label="بستن چت">
                <X className="size-4" />
              </Button>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2">
                <TabsTrigger value="chatbot" className="gap-1 text-xs">
                  <Sparkles className="size-3" />
                  چت‌بات
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-1 text-xs">
                  <LifeBuoy className="size-3" />
                  چت پشتیبانی
                </TabsTrigger>
                <TabsTrigger value="messenger" className="gap-1 text-xs">
                  <Users className="size-3" />
                  پیام‌ها
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chatbot" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderMessages(msgs, "سوال فنی یا محصول خود را بپرسید. چت‌بات با مدل AI پاسخ می‌دهد.", loading ? "در حال فکر کردن…" : undefined)}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="support" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderMessages(supportMsgs, undefined, supportLoading ? "در حال ارسال به پشتیبانی…" : undefined)}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messenger" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderMessages(personalMsgs)}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Separator />
            <CardFooter className="p-2">
              {activeTab === "chatbot" && (
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
              )}
              {activeTab === "support" && (
                <form onSubmit={sendSupport} className="flex w-full gap-2">
                  <Input
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    placeholder="پیام به تیم پشتیبانی…"
                    className="flex-1 h-8 text-xs"
                    disabled={supportLoading}
                  />
                  <Button type="submit" disabled={supportLoading || !supportInput.trim()} size="sm" className="px-3">
                    {supportLoading ? "…" : <><Send className="size-3.5 me-1" /> ارسال</>}
                  </Button>
                </form>
              )}
              {activeTab === "messenger" && (
                <form onSubmit={sendPersonal} className="flex w-full gap-2">
                  <Input
                    value={personalInput}
                    onChange={(e) => setPersonalInput(e.target.value)}
                    placeholder="پیام شخصی…"
                    className="flex-1 h-8 text-xs"
                  />
                  <Button type="submit" disabled={!personalInput.trim()} size="sm" className="px-3">
                    <Send className="size-3.5 me-1" /> ارسال
                  </Button>
                </form>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headset, X, Sparkles, LifeBuoy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Msg = { role: "user" | "assistant"; text: string; time: number };
type TabType = "chatbot" | "support";

const STORAGE_KEY = "tb_chat_history";
const SUPPORT_STORAGE_KEY = "tb_support_chat_history";
const PERSONAL_STORAGE_KEY = "tb_personal_chat_history";

const supportWelcome: Msg = {
  role: "assistant",
  text: "پشتیبانی برخط اینجاست تا شما را راهنمایی کنید",
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Only close if it's not the launcher button (which is unmounted when open anyway, but just in case)
        const button = (target as Element).closest('button');
        if (button && button.getAttribute('aria-label') === 'پشتیبانی تکباکس') {
          return;
        }
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

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
      {/* Floating Launcher Button (Always present to act as toggle) */}
      <div className="fixed bottom-5 left-5" style={{ zIndex: zIndex.popover + 10 }}>
        <Button
          type="button"
          onClick={() => { setOpen(!open); setHasUnread(false); }}
          className="rounded-full shadow-none size-12 p-0 bg-transparent hover:bg-muted text-foreground transition-all duration-300"
          aria-label={open ? "بستن چت" : "پشتیبانی تکباکس"}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X className="size-5" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Headset className="size-5" />
              </motion.div>
            )}
          </AnimatePresence>
          {!open && hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={containerRef} 
            dir="rtl" 
            className="fixed bottom-[80px] left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" 
            style={{ zIndex: zIndex.chatbot }}
          >
            <Card className="flex h-[520px] max-h-[calc(100vh-100px)] flex-col overflow-hidden p-0 shadow-xl border border-border">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start rounded-none bg-transparent px-2 h-auto pt-3 pb-3 border-b">
                  <TabsTrigger value="chatbot" className="gap-1 text-xs">
                    <Sparkles className="size-3" />
                    پشتیبانی هوشمند
                  </TabsTrigger>
                <TabsTrigger value="support" className="gap-1 text-xs">
                  <LifeBuoy className="size-3" />
                  پشتیبانی برخط
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chatbot" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderMessages(msgs, "پشتیبانی هوشمند اینجاست تا شما را راهنمایی کند", loading ? "در حال فکر کردن…" : undefined)}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="support" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full">
                  <CardContent className="p-3 space-y-3 min-h-full">
                    {renderMessages(supportMsgs.filter((m, i) => i > 0 || supportMsgs.length > 1), "پشتیبانی برخط اینجاست تا شما را راهنمایی کند", supportLoading ? "در حال ارسال به پشتیبانی…" : undefined)}
                    <div ref={endRef} />
                  </CardContent>
                </ScrollArea>
              </TabsContent>

            </Tabs>

            <CardFooter className="p-2 bg-card border-t">
              {activeTab === "chatbot" && (
                <form onSubmit={send} className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سوال فنی / محصول خود را بپرسید…"
                    className="flex-1 h-8 text-xs"
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !input.trim()} size="sm" className="px-3 text-xs">
                    {loading ? "…" : "ارسال"}
                  </Button>
                </form>
              )}
              {activeTab === "support" && (
                <form onSubmit={sendSupport} className="flex w-full gap-2">
                  <Input
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    placeholder="پیام به پشتیبانی برخط…"
                    className="flex-1 h-8 text-xs"
                    disabled={supportLoading}
                  />
                  <Button type="submit" disabled={supportLoading || !supportInput.trim()} size="sm" className="px-3 text-xs">
                    {supportLoading ? "…" : "ارسال"}
                  </Button>
                </form>
              )}
            </CardFooter>
          </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

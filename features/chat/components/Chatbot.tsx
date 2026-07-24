"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headset, X, Sparkles, LifeBuoy, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Msg = { role: "user" | "assistant"; text: string; time: number };
type TabType = "chatbot" | "support";

const STORAGE_KEY = "tb_chat_history";
const SUPPORT_STORAGE_KEY = "tb_support_chat_history";

const supportWelcome: Msg = {
  role: "assistant",
  text: "پشتیبانی برخط اینجاست تا شما را راهنمایی کنند",
  time: Date.now(),
};

// ── Inline-send input (send button INSIDE the input on the left in RTL) ──────
interface InlineInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  placeholder: string;
  disabled: boolean;
  isLoading: boolean;
}

function InlineInput({ value, onChange, onSubmit, placeholder, disabled, isLoading }: InlineInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex-1 min-w-0">
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-xs pr-3 pl-10 w-full"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          autoComplete="off"
        />
        {/* Send button INSIDE input — positioned on the left (in RTL, left = start of text) */}
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="ارسال"
          className="absolute left-1.5 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <span className="text-[10px]">…</span>
          ) : (
            <Send className="size-3.5" />
          )}
        </button>
      </div>
    </form>
  );
}

// ── Message list renderer ─────────────────────────────────────────────────────
interface MessageListProps {
  messages: Msg[];
  emptyText?: string;
  loadingText?: string;
  endRef: React.RefObject<HTMLDivElement | null>;
}

function MessageList({ messages, emptyText, loadingText, endRef }: MessageListProps) {
  return (
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
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border rounded-bl-sm"
            }`}
          >
            {m.text}
          </div>
        </div>
      ))}
      {loadingText && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm border bg-card px-3 py-2 text-xs text-muted-foreground">
            {loadingText}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </>
  );
}

// ── Main Chatbot component ────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("chatbot");
  const [input, setInput] = useState("");
  const [supportInput, setSupportInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [supportMsgs, setSupportMsgs] = useState<Msg[]>([supportWelcome]);
  const [loading, setLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        const button = (target as Element).closest("button");
        if (button && button.getAttribute("aria-label") === "پشتیبانی تکباکس") return;
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
      if (s) setMsgs(JSON.parse(s));
      if (support) setSupportMsgs(JSON.parse(support));
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
      const reply =
        data?.reply ||
        data?.error ||
        "پاسخی دریافت نشد – کلید API را در .env تنظیم کنید: CHAT_API_KEY / CHAT_BASE_URL";
      setMsgs((m) => [...m, { role: "assistant", text: reply, time: Date.now() }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: "خطا در اتصال به سرویس چت – حالت آفلاین.", time: Date.now() },
      ]);
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

  return (
    <>
      {/* ── Launcher button ── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-5"
            style={{ zIndex: zIndex.popover }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(true);
                setHasUnread(false);
              }}
              className="relative rounded-full size-12 p-0 bg-transparent text-foreground transition-transform duration-150 hover:-translate-y-0.5 flex items-center justify-center focus:outline-none"
              aria-label="پشتیبانی تکباکس"
            >
              <Headset className="size-5" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat modal ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={containerRef}
            dir="rtl"
            className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]"
            style={{ zIndex: zIndex.chatbot }}
          >
            <Card className="flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0 shadow-xl border border-border/80 bg-background/90 backdrop-blur-md">

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as TabType)}
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="w-full justify-start rounded-none bg-transparent px-2 h-auto pt-2 pb-3 border-b border-border/50">
                  <TabsTrigger value="chatbot" className="gap-1 text-xs bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <Sparkles className="size-3" />
                    پشتیبانی هوشمند
                  </TabsTrigger>
                  <TabsTrigger value="support" className="gap-1 text-xs bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <LifeBuoy className="size-3" />
                    پشتیبانی برخط
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chatbot" className="flex-1 m-0 min-h-0">
                  <ScrollArea className="h-full">
                    <CardContent className="p-3 space-y-3 min-h-full">
                      <MessageList
                        messages={msgs}
                        emptyText="پشتیبانی هوشمند اینجاست تا شما را راهنمایی کند"
                        loadingText={loading ? "در حال فکر کردن…" : undefined}
                        endRef={endRef}
                      />
                    </CardContent>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="support" className="flex-1 m-0 min-h-0">
                  <ScrollArea className="h-full">
                    <CardContent className="p-3 space-y-3 min-h-full">
                      <MessageList
                        messages={supportMsgs.filter((m, i) => i > 0 || supportMsgs.length > 1)}
                        emptyText="پشتیبانی برخط اینجاست تا شما را راهنمایی کند"
                        loadingText={supportLoading ? "در حال ارسال به پشتیبانی…" : undefined}
                        endRef={endRef}
                      />
                    </CardContent>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              {/* ── Footer: close button (bottom-left) + inline-send input ── */}
              <div className="p-2 border-t border-border/50 flex items-center gap-2">
                {/* Close button — bottom-left corner (in RTL left = start of line) */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="بستن چت"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="size-4" />
                </button>

                {activeTab === "chatbot" ? (
                  <InlineInput
                    value={input}
                    onChange={setInput}
                    onSubmit={send}
                    placeholder="پیام به پشتیبانی هوشمند ..."
                    disabled={loading}
                    isLoading={loading}
                  />
                ) : (
                  <InlineInput
                    value={supportInput}
                    onChange={setSupportInput}
                    onSubmit={sendSupport}
                    placeholder="پیام به پشتیبانی برخط…"
                    disabled={supportLoading}
                    isLoading={supportLoading}
                  />
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

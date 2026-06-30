"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { ChipButton } from "@/components/ui/ChipButton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

type Msg = { role: "user" | "assistant"; text: string; time: number };

const STORAGE_KEY = "tb_chat_history";

export default function Chatbot(){
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    try{ const s = localStorage.getItem(STORAGE_KEY); if(s) setMsgs(JSON.parse(s)); }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs]);

  const send = async (e?: React.FormEvent)=>{
    e?.preventDefault();
    const text = input.trim();
    if(!text || loading) return;
    const userMsg: Msg = { role:"user", text, time: Date.now() };
    setMsgs(m=>[...m, userMsg]);
    setInput("");
    setLoading(true);
    try{
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages: [...msgs, userMsg].slice(-12).map(m=>({role:m.role, content:m.text})),
          // context: product / page – can extend later
        })
      });
      const data = await res.json();
      const reply = data?.reply || data?.error || "پاسخی دریافت نشد – کلید API را در .env تنظیم کنید: CHAT_API_KEY / CHAT_BASE_URL";
      setMsgs(m=>[...m, {role:"assistant", text: reply, time: Date.now()}]);
    }catch(err:any){
      setMsgs(m=>[...m, {role:"assistant", text:"خطا در اتصال به سرویس چت – حالت آفلاین.", time: Date.now()}]);
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <FloatingActionButton
        onClick={()=>setOpen(true)}
        hidden={open}
        className="bottom-5 left-5"
        style={{ zIndex: zIndex.popover }}
        aria-label="چت با تکباکس"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline">پرسش از تکباکس</span>
      </FloatingActionButton>

      {/* panel */}
      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{zIndex:zIndex.chatbot}}>
          <div className="tb-overlay-panel flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--tb-border)] bg-[var(--tb-surface-1)] px-3 py-2.5">
              <div className="text-[13px] font-black">دستیار تکباکس <span className="text-[10px] font-normal text-[var(--tb-muted-foreground)]">AI Beta</span></div>
              <div className="flex items-center gap-2">
                <Button variant="link" size="xs" onClick={()=>{setMsgs([]); localStorage.removeItem(STORAGE_KEY)}} className="text-[10px] text-[var(--tb-muted-foreground)] hover:text-[var(--tb-foreground)]">پاک‌سازی</Button>
                <CloseButton onClick={()=>setOpen(false)} label="بستن چت" />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--tb-background)] p-3 text-[13px]">
              {msgs.length===0 && (
                <div className="text-[12px] leading-6 text-[var(--tb-muted-foreground)]">
                  سلام! من دستیار هوشمند تکباکس هستم.<br/>
                  درباره محصولات (مثلا <b>QNAP-2277</b>)، مشکلات شبکه، یا مقالات بپرسید.<br/>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["قیمت QNAP-2277؟","RAID مناسب سرور HP؟","فرق NAS و SAN؟","مشکل iSCSI؟"].map(s=>(
                      <ChipButton key={s} tone="brand" onClick={()=>setInput(s)} className="px-2 py-1 text-[10px]">{s}</ChipButton>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-[var(--tb-radius-xl)] px-3 py-2 leading-6 whitespace-pre-wrap ${m.role==="user" ? "text-white" : ""}`}
                    style={{background: m.role==="user" ? "var(--tb-brand)" : "var(--tb-muted)", color: m.role==="user" ? "var(--tb-brand-foreground)" : "var(--tb-foreground)"}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[11px] text-[var(--tb-muted-foreground)]">در حال فکر کردن…</div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="flex gap-2 border-t border-[var(--tb-border)] bg-[var(--tb-card)] p-2">
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder="سوال فنی / محصول خود را بپرسید…"
                className="input flex-1 !py-2 text-[13px]"
                disabled={loading}
              />
              <Button disabled={loading || !input.trim()} size="sm" className="px-4 text-xs disabled:opacity-50">
                {loading ? "…" : "ارسال"}
              </Button>
            </form>
            <div className="px-3 pb-2 text-center text-[9px] text-[var(--tb-muted-foreground)]">
              پاسخ‌ها ممکن است نادرست باشند – همیشه مستندات رسمی را چک کنید • API: <code>/api/chat</code>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

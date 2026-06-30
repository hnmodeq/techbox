"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";

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
      <button
        onClick={()=>setOpen(true)}
        className="fixed bottom-5 left-5 rounded-full shadow-2xl flex items-center gap-2 px-4 py-3 text-sm font-bold transition-transform hover:scale-105"
        style={{background:"linear-gradient(135deg, color-mix(in oklch, var(--tb-brand) 70%, black), var(--tb-brand))", color:"var(--tb-brand-foreground)", display: open ? "none" : "flex", zIndex: zIndex.popover}}
        aria-label="چت با تکباکس"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline">پرسش از تکباکس</span>
      </button>

      {/* panel */}
      {open && (
        <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{zIndex:zIndex.chatbot}}>
          <div className="card flex flex-col h-[520px] max-h-[72vh] overflow-hidden p-0" style={{boxShadow:"0 20px 60px rgba(0,0,0,.45)"}}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{borderColor:"var(--border)", background:"var(--surface-1, var(--muted))"}}>
              <div className="text-[13px] font-black">دستیار تکباکس <span className="text-[10px] font-normal" style={{color:"var(--muted-foreground)"}}>AI Beta</span></div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{setMsgs([]); localStorage.removeItem(STORAGE_KEY)}} className="text-[10px] text-muted-foreground hover:text-foreground">پاک‌سازی</button>
                <button onClick={()=>setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-[13px]" style={{background:"var(--background)"}}>
              {msgs.length===0 && (
                <div className="text-[12px] leading-6" style={{color:"var(--muted-foreground)"}}>
                  سلام! من دستیار هوشمند تکباکس هستم.<br/>
                  درباره محصولات (مثلا <b>QNAP-2277</b>)، مشکلات شبکه، یا مقالات بپرسید.<br/>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["قیمت QNAP-2277؟","RAID مناسب سرور HP؟","فرق NAS و SAN؟","مشکل iSCSI؟"].map(s=>(
                      <button key={s} onClick={()=>setInput(s)} className="text-[10px] px-2 py-1 rounded-full border" style={{borderColor:"var(--border)"}}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2 leading-6 whitespace-pre-wrap ${m.role==="user" ? "text-white" : ""}`}
                    style={{background: m.role==="user" ? "var(--brand)" : "var(--muted)", color: m.role==="user" ? "white" : "var(--foreground)"}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[11px]" style={{color:"var(--muted-foreground)"}}>در حال فکر کردن…</div>}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="border-t p-2 flex gap-2" style={{borderColor:"var(--border)", background:"var(--card)"}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder="سوال فنی / محصول خود را بپرسید…"
                className="input flex-1 !py-2 text-[13px]"
                disabled={loading}
              />
              <button disabled={loading || !input.trim()} className="btn btn-primary text-xs px-4 disabled:opacity-50">
                {loading ? "…" : "ارسال"}
              </button>
            </form>
            <div className="px-3 pb-2 text-[9px] text-center" style={{color:"var(--muted-foreground)"}}>
              پاسخ‌ها ممکن است نادرست باشند – همیشه مستندات رسمی را چک کنید • API: <code>/api/chat</code>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

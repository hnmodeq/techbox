"use client";
import { useState, useRef, useEffect } from "react";
import { zIndex } from "@/design";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { ChipButton } from "@/components/ui/ChipButton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { Icon } from "@/design/icons";

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
 {!open && (
   <button
     type="button"
     onClick={() => setOpen(true)}
     style={{ zIndex: zIndex.popover }}
     className="fixed bottom-5 left-5 rounded-full bg-[var(--card-background)] border border-[var(--border-color)] px-4.5 py-2.5 text-[var(--primary-text)] shadow-lg hover:bg-[var(--muted-background)] transition-all flex items-center gap-2 cursor-pointer font-normal text-xs sm:text-sm"
     aria-label="پشتیبانی تکباکس"
   >
     <Icon name="chat" size={18} className="sm:hidden text-[var(--home)]" />
     <span>پشتیبانی</span>
   </button>
 )}

 {/* panel */}
 {open && (
 <div dir="rtl" className="fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[380px]" style={{zIndex:zIndex.chatbot}}>
 <div className="tb-overlay-panel flex h-[520px] max-h-[72vh] flex-col overflow-hidden p-0">
 <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-background)] px-3 py-2.5">
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] ">دستیار تکباکس <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">AI Beta</span></div>
 <div className="flex items-center gap-2">
 <Button variant="link" size="xs" onClick={()=>{setMsgs([]); localStorage.removeItem(STORAGE_KEY)}} className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color hover:text-[var(--primary-text)]">پاک‌سازی</Button>
 <CloseButton onClick={()=>setOpen(false)} label="بستن چت" />
 </div>
 </div>

 <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--main-background)] p-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
 {msgs.length===0 && (
 <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 سلام! من دستیار هوشمند تکباکس هستم.<br/>
 درباره محصولات (مثلا <b>QNAP-2277</b>)، مشکلات شبکه، یا مقالات بپرسید.<br/>
 <div className="flex flex-wrap gap-1.5 mt-2">
 {["قیمت QNAP-2277؟","RAID مناسب سرور HP؟","فرق NAS و SAN؟","مشکل iSCSI؟"].map(s=>(
 <ChipButton key={s} tone="brand" onClick={()=>setInput(s)} className="px-2 py-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{s}</ChipButton>
 ))}
 </div>
 </div>
 )}
 {msgs.map((m,i)=>(
 <div key={i} className={`flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
 <div className={`max-w-[82%] rounded-[var(--corner-radius)] px-3 py-2 whitespace-pre-wrap ${m.role==="user" ? "text-[#ffffff]" : ""}`}
 style={{background: m.role==="user" ? "var(--home)" : "var(--muted-background)", color: m.role==="user" ? "#ffffff" : "var(--primary-text)"}}>
 {m.text}
 </div>
 </div>
 ))}
 {loading && <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">در حال فکر کردن…</div>}
 <div ref={endRef} />
 </div>

 <form onSubmit={send} className="flex gap-2 border-t border-[var(--border-color)] bg-[var(--card-background)] p-2">
 <input
 value={input}
 onChange={e=>setInput(e.target.value)}
 placeholder="سوال فنی / محصول خود را بپرسید…"
 className="input flex-1 !py-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]"
 disabled={loading}
 />
 <Button disabled={loading || !input.trim()} size="sm" className="px-4 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] disabled:opacity-50">
 {loading ? "…" : "ارسال"}
 </Button>
 </form>
 <div className="px-3 pb-2 text-center text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 پاسخ‌ها ممکن است نادرست باشند – همیشه مستندات رسمی را چک کنید • API: <code>/api/chat</code>
 </div>
 </div>
 </div>
 )}
 </>
 );
}

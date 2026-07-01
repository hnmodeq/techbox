"use client";
import { useEffect, useState, useCallback } from "react";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

function getFingerprint(){
 if(typeof window==="undefined") return "srv";
 let fp = localStorage.getItem("tb_fp");
 if(!fp){ fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("tb_fp", fp); }
 return fp;
}

export function LikeButton({ contentType, slug, initial = 0 }: { contentType: string; slug: string; initial?: number }) {
 const [liked, setLiked] = useState(false);
 const [count, setCount] = useState(initial);
 const [busy, setBusy] = useState(false);

 const key = `tb_like_${contentType}_${slug}`;
 useEffect(()=>{ setLiked(localStorage.getItem(key)==="1"); }, [key]);

 const toggle = useCallback(async ()=>{
 if(busy) return;
 setBusy(true);
 const fp = getFingerprint();
 const optimisticLiked = !liked;
 setLiked(optimisticLiked);
 setCount(c=> c + (optimisticLiked?1:-1));
 try{
 const res = await fetch("/api/like", {
 method:"POST",
 headers:{"Content-Type":"application/json"},
 body: JSON.stringify({ module: contentType, slug, fingerprint: fp })
 });
 if(res.ok){
 const data = await res.json();
 setLiked(data.liked);
 setCount(data.likes);
 if(data.liked) localStorage.setItem(key,"1"); else localStorage.removeItem(key);
 }
 }catch{}
 finally{ setBusy(false); }
 }, [liked, busy, contentType, slug, key]);

 return (
 <Button onClick={toggle} disabled={busy} variant={liked ? "primary" : "ghost"} size="sm" className="gap-2 tb-text-sm disabled:opacity-60" aria-pressed={liked}>
 <Heart size={20} fill={liked ? "currentColor" : "none"} strokeWidth={2} className={liked ? "text-[var(--tb-danger)]" : ""} aria-hidden />
 <span className="" style={{fontVariantNumeric:"tabular-nums"}}>{count.toLocaleString("fa-IR")}</span>
 <span className="hidden sm:inline">پسندیدم</span>
 <Eye size={16} className="opacity-60 hidden md:inline" />
 </Button>
 );
}

export function CommentVote({ id, initialLikes = 0, initialDislikes = 0 }: { id: string; initialLikes?: number; initialDislikes?: number }) {
 const [l, setL] = useState(initialLikes);
 const [d, setD] = useState(initialDislikes);
 const [v, setV] = useState<"up"|"down"|null>(null);

 useEffect(()=>{
 const saved = localStorage.getItem(`tb_cvote_${id}`);
 if(saved==="up"||saved==="down") setV(saved);
 },[id]);

 const vote = async (type:"up"|"down")=>{
 const next = v===type ? 0 : (type==="up"?1:-1);
 const prev = v==="up"?1 : v==="down"?-1:0;
 // optimistic
 setL(x=> x + (next===1?1:0) - (prev===1?1:0));
 setD(x=> x + (next===-1?1:0) - (prev===-1?1:0));
 setV(next===0?null:type);
 try{
 const res = await fetch("/api/comments/vote", {
 method:"POST", headers:{"Content-Type":"application/json"},
 body: JSON.stringify({ commentId: id, fingerprint: getFingerprint(), vote: next })
 });
 if(res.ok){
 const data = await res.json();
 setL(data.likes); setD(data.dislikes);
 }
 }catch{}
 if(next===0) localStorage.removeItem(`tb_cvote_${id}`); else localStorage.setItem(`tb_cvote_${id}`, type);
 };

 return (
 <div className="flex items-center gap-3 tb-text-sm text-[var(--tb-fg-muted)]">
 <Button onClick={()=>vote("up")} variant="link" size="xs" className={v==="up" ? "text-[var(--tb-success)] " : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}>▲ {l.toLocaleString("fa-IR")}</Button>
 <Button onClick={()=>vote("down")} variant="link" size="xs" className={v==="down" ? "text-[var(--tb-danger)] " : "text-[var(--tb-fg-muted)] hover:text-[var(--tb-fg-primary)]"}>▼ {d.toLocaleString("fa-IR")}</Button>
 </div>
 );
}

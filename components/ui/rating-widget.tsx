"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/design/icons";

export function RatingWidget({ module, slug }: { module: string; slug: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState<number | null>(null);
  useEffect(() => { fetch(`/api/rating?module=${module}&slug=${slug}`).then(r=>r.json()).then(d=>{setRating(d.rating);setCount(d.ratingCount||0);setMine(d.myRating);}).catch(()=>{}); }, [module, slug]);
  const submit = async (value:number) => {
    const res = await fetch('/api/rating',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({module,slug,value})});
    if(res.status===401){ window.dispatchEvent(new CustomEvent('tb_open_auth')); return; }
    if(res.ok){ const d=await res.json(); setRating(d.rating); setCount(d.ratingCount); setMine(d.myRating); window.dispatchEvent(new CustomEvent('tb_stats_update',{detail:{module,slug,rating:d.rating,ratingCount:d.ratingCount}})); }
  };
  return <div className="flex flex-wrap items-center gap-2"><span className="paragraph-color text-xs">امتیاز شما:</span>{[1,2,3,4,5].map(v=><button key={v} type="button" onClick={()=>submit(v)} className={v <= (mine||0) ? 'text-[var(--warning)]' : 'paragraph-color hover:text-[var(--warning)]'}><Icon name="star" size={20} className={v <= (mine||0) ? 'fill-current' : ''}/></button>)}<span className="text-xs paragraph-color">{rating ? `${rating.toFixed(1)} (${count.toLocaleString('fa-IR')})` : 'بدون امتیاز'}</span></div>;
}

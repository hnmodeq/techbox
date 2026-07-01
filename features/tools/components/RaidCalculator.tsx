"use client";
import { useMemo, useState } from "react";

type RaidLevel = "0"|"1"|"5"|"6"|"10";

const overhead: Record<RaidLevel, (n:number)=>{usable:number; fault:number}> = {
 "0": n => ({usable: n, fault: 0}),
 "1": n => ({usable: Math.floor(n/2), fault: 1}),
 "5": n => ({usable: Math.max(0, n-1), fault: 1}),
 "6": n => ({usable: Math.max(0, n-2), fault: 2}),
 "10": n => ({usable: Math.floor(n/2), fault: Math.floor(n/2)}),
};

export default function RaidCalculator(){
 const [disks, setDisks] = useState(4);
 const [size, setSize] = useState(4000); // GB
 const [level, setLevel] = useState<RaidLevel>("5");

 const calc = useMemo(()=>{
 const o = overhead[level](disks);
 const raw = disks * size;
 const usable = o.usable * size;
 const eff = raw ? Math.round(usable / raw * 100) : 0;
 return { ...o, raw, usable, eff };
 }, [disks, size, level]);

 return (
 <div className="card p-5 space-y-4" dir="rtl">
 <div className="flex items-center justify-between">
 <h3 className=" tb-text-lg text-[var(--tb-raid)]">RAID Calculator</h3>
 <span className="tb-text-sm text-muted-foreground">تکباکس – ابزار زیرساخت</span>
 </div>

 <div className="grid sm:grid-cols-3 gap-3 tb-text-md">
 <label className="space-y-1">
 <span className="tb-text-sm text-muted-foreground">تعداد دیسک</span>
 <input type="number" min={2} max={24} value={disks} onChange={e=>setDisks(Math.max(2, parseInt(e.target.value)||2))} className="input" />
 </label>
 <label className="space-y-1">
 <span className="tb-text-sm text-muted-foreground">ظرفیت هر دیسک (GB)</span>
 <input type="number" min={100} step={100} value={size} onChange={e=>setSize(parseInt(e.target.value)||0)} className="input" />
 </label>
 <label className="space-y-1">
 <span className="tb-text-sm text-muted-foreground">سطح RAID</span>
 <select value={level} onChange={e=>setLevel(e.target.value as RaidLevel)} className="input">
 <option value="0">RAID 0</option>
 <option value="1">RAID 1</option>
 <option value="5">RAID 5</option>
 <option value="6">RAID 6</option>
 <option value="10">RAID 10</option>
 </select>
 </label>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
 {[
 ["ظرفیت خام", `${calc.raw.toLocaleString("fa-IR")} GB`],
 ["قابل استفاده", `${calc.usable.toLocaleString("fa-IR")} GB`],
 ["تحمل خطا", `${calc.fault.toLocaleString("fa-IR")} دیسک`],
 ["راندمان", `${calc.eff.toLocaleString("fa-IR")}%`],
 ].map(([k,v])=>(
 <div key={k as string} className="rounded-[var(--tb-radius-lg)] border border-[var(--tb-border)] bg-[var(--tb-bg-secondary)]/60 p-3">
 <div className="tb-text-sm text-muted-foreground">{k}</div>
 <div className=" text-[var(--tb-raid)] mt-1">{v}</div>
 </div>
 ))}
 </div>

 <p className="tb-text-sm text-muted-foreground ">
 محاسبه تئوریک – برای RAID5 حداقل ۳ دیسک، RAID6 حداقل ۴ دیسک، RAID10 زوج. مناسب سرورهای HPE / Dell که در بلاگ تکباکس بررسی کردیم.
 </p>
 </div>
 );
}

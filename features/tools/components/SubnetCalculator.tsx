"use client";
import { useMemo, useState } from "react";

function ipToInt(ip:string){ return ip.split(".").reduce((a,o)=> (a<<8)+parseInt(o||"0"),0)>>>0; }
function intToIp(n:number){ return [24,16,8,0].map(s=>(n>>>s)&255).join("."); }

export default function SubnetCalculator(){
 const [ip, setIp] = useState("192.168.1.0");
 const [cidr, setCidr] = useState(24);

 const out = useMemo(()=>{
 try{
 const mask = ~((1 << (32-cidr)) -1) >>>0;
 const net = ipToInt(ip) & mask;
 const broadcast = net | (~mask >>>0);
 const hosts = Math.max(0, (1 << (32-cidr)) -2);
 return {
 network: intToIp(net),
 broadcast: intToIp(broadcast),
 mask: intToIp(mask),
 first: intToIp(net+1),
 last: intToIp(broadcast-1),
 hosts
 };
 }catch{ return null; }
 },[ip,cidr]);

 return (
 <div className="card p-5 space-y-4" dir="rtl">
 <h3 className=" tb-text-lg text-[var(--tb-subnet)]">ماشین‌حساب ساب‌نت</h3>
 <div className="grid sm:grid-cols-2 gap-3">
 <label className="tb-text-md space-y-1">
 <span className="tb-text-sm text-muted-foreground">IP</span>
 <input value={ip} onChange={e=>setIp(e.target.value)} className="input font-mono text-left" dir="ltr" />
 </label>
 <label className="tb-text-md space-y-1">
 <span className="tb-text-sm text-muted-foreground">CIDR /{cidr}</span>
 <input type="range" min={8} max={30} value={cidr} onChange={e=>setCidr(parseInt(e.target.value))} className="w-full" />
 </label>
 </div>
 {out && (
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 tb-text-sm font-mono" dir="ltr">
 {Object.entries({
 Network: out.network,
 Broadcast: out.broadcast,
 Mask: out.mask,
 "First Host": out.first,
 "Last Host": out.last,
 "Usable Hosts": out.hosts.toString()
 }).map(([k,v])=>(
 <div key={k} className="rounded-[var(--tb-radius-md)] bg-[var(--tb-bg-secondary)] px-3 py-2">
 <div className="tb-text-sm text-muted-foreground font-sans" dir="rtl">{k}</div>
 <div>{v}</div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}

"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserClient, logout } from "@/lib/auth";
import type { AppUser } from "@/lib/auth";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import PageHeader from "@/components/effects/PageHeader";

export default function AccountPage(){
 const [user, setUser] = useState<AppUser | null>(null);
 const [name, setName] = useState("");
 const [lastName, setLastName] = useState("");
 const [nick, setNick] = useState("");
 const [email, setEmail] = useState("");
 const [job, setJob] = useState("");
 const [birthday, setBirthday] = useState("");
 const [avatar, setAvatar] = useState<string>("/assets/hooman.png");
 const [saved, setSaved] = useState(false);

 useEffect(()=>{
 const u = getCurrentUserClient();
 setUser(u);
 if(u){
 const parts = u.name.split(" ");
 setName(parts[0]||"");
 setLastName(parts.slice(1).join(" ")||"");
 setNick(u.username);
 setEmail(u.email);
 setAvatar(u.avatar || "/assets/hooman.png");
 // load local profile overrides
 const local = localStorage.getItem("tb_profile_"+u.username);
 if(local){ try{ const p=JSON.parse(local); setNick(p.nick || u.username); setJob(p.job || ""); setBirthday(p.birthday || ""); setAvatar(p.avatar || u.avatar || "/assets/hooman.png");}catch{} }
 }
 },[]);

 const onAvatar = (e: React.ChangeEvent<HTMLInputElement>)=>{
 const f = e.target.files?.[0];
 if(!f) return;
 const r = new FileReader();
 r.onload = ()=> setAvatar(String(r.result));
 r.readAsDataURL(f);
 };

 const save = (e: React.FormEvent)=>{
 e.preventDefault();
 if(user){
 localStorage.setItem("tb_profile_"+user.username, JSON.stringify({ nick, job, birthday, avatar, name: name+" "+lastName, email }));
 setSaved(true);
 setTimeout(()=>setSaved(false), 1800);
 }
 };

 if(!user){
 return (
 <main className="max-w-md mx-auto px-5 py-20 text-center" dir="rtl">
 <div className="card p-8 space-y-4">
 <h1 className="tb-text-lg ">حساب کاربری</h1>
 <p className="tb-text-md text-muted-foreground">برای دسترسی به پروفایل وارد شوید.</p>
 <ButtonLink href="/admin/login" className="w-full">ورود ویراستار</ButtonLink>
 <p className="tb-text-sm text-muted-foreground">تست: sara / nima / rojina / admin – رمز: techbox123</p>
 </div>
 </main>
 );
 }

 return (
 <main className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
 <PageHeader
 colorVar="--tb-account"
 title="حساب کاربری"
 titleClassName="text-[var(--tb-account)]"
 >
 <div className="tb-text-sm text-muted-foreground">{user.role==="super_admin" ? "مدیر کل" : "ویراستار"} • {user.modules.join("، ")}</div>
 </PageHeader>

 <form onSubmit={save} className="grid lg:grid-cols-3 gap-5">
 {/* avatar card */}
 <div className="card p-5 text-center space-y-3 h-fit">
 <div className="relative w-28 h-28 mx-auto">
 <Image src={avatar} width={112} height={112} className="h-28 w-28 rounded-[var(--tb-radius-full)] object-cover ring-2 ring-[var(--tb-border)]" alt={user.name} />
 <label className="absolute bottom-0 left-0 cursor-pointer rounded-[var(--tb-radius-full)] bg-[var(--tb-primary)] px-2 py-1 tb-text-sm text-[var(--tb-on-accent)] shadow-[var(--tb-shadow-sm)]">
 تغییر
 <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
 </label>
 </div>
 <div className="">{name} {lastName}</div>
 <div className="tb-text-sm text-muted-foreground">@{nick}</div>
 <div className="tb-text-sm">{job || "—"}</div>
 <Button type="button" variant="ghost" onClick={()=>{logout(); location.href="/";}} className="mt-2 w-full tb-text-sm">خروج از حساب</Button>
 </div>

 {/* form */}
 <div className="lg:col-span-2 card p-5 space-y-4">
 <div className="grid sm:grid-cols-2 gap-3">
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">نام</span>
 <input value={name} onChange={e=>setName(e.target.value)} className="input" />
 </label>
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">نام خانوادگی</span>
 <input value={lastName} onChange={e=>setLastName(e.target.value)} className="input" />
 </label>
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">نام کاربری</span>
 <input value={nick} onChange={e=>setNick(e.target.value)} className="input" dir="ltr" />
 </label>
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">ایمیل</span>
 <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" dir="ltr" />
 </label>
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">سمت شغلی</span>
 <input value={job} onChange={e=>setJob(e.target.value)} placeholder="مثلا: کارشناس شبکه" className="input" />
 </label>
 <label className="tb-text-sm space-y-1"><span className="text-muted-foreground">تاریخ تولد</span>
 <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="input" />
 </label>
 </div>

 <div className="border-t border-[var(--tb-border)] pt-4 space-y-3">
 <h4 className=" tb-text-md">تغییر رمز عبور</h4>
 <div className="grid sm:grid-cols-2 gap-3">
 <input type="password" placeholder="رمز فعلی" className="input tb-text-md" />
 <input type="password" placeholder="رمز جدید" className="input tb-text-md" />
 </div>
 <p className="tb-text-sm text-muted-foreground">دمو – در نسخه پروداکشن به /api/auth/change-password ارسال می‌شود.</p>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <span className={`tb-text-sm transition-opacity ${saved ? "opacity-100 text-[var(--tb-success)]" : "opacity-0"}`}>ذخیره شد ✓</span>
 <Button>ذخیره پروفایل</Button>
 </div>
 </div>

 {/* side stats */}
 <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
 {[
 ["مقالات منتشر شده","12"],
 ["دیدگاه‌ها","47"],
 ["امتیاز","4.8"],
 ].map(([k,v])=>(
 <div key={k as string} className="card p-4 text-center">
 <div className="tb-text-hero text-[var(--tb-primary)]">{v}</div>
 <div className="tb-text-sm text-muted-foreground mt-1">{k}</div>
 </div>
 ))}
 </div>
 </form>
 </main>
 );
}

"use client";
import { useEffect, useState } from "react";
import { getCurrentUserClient, logout } from "@/lib/auth";
import type { AppUser } from "@/lib/auth";
import Link from "next/link";

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
      if(local){ try{ const p=JSON.parse(local); setNick(p.nick||nick); setJob(p.job||""); setBirthday(p.birthday||""); setAvatar(p.avatar||avatar);}catch{} }
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
          <h1 className="text-xl font-black">حساب کاربری</h1>
          <p className="text-sm text-muted-foreground">برای دسترسی به پروفایل وارد شوید.</p>
          <Link href="/admin/login" className="btn btn-primary w-full">ورود ویراستار</Link>
          <p className="text-[11px] text-muted-foreground">تست: sara / nima / rojina / admin – رمز: techbox123</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black">حساب کاربری</h1>
        <div className="text-xs text-muted-foreground">{user.role==="super_admin" ? "مدیر کل" : "ویراستار"} • {user.modules.join("، ")}</div>
      </div>

      <form onSubmit={save} className="grid lg:grid-cols-3 gap-5">
        {/* avatar card */}
        <div className="card p-5 text-center space-y-3 h-fit">
          <div className="relative w-28 h-28 mx-auto">
            <img src={avatar} className="w-28 h-28 rounded-full object-cover ring-2 ring-border" alt="" />
            <label className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-full cursor-pointer shadow">
              تغییر
              <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            </label>
          </div>
          <div className="font-bold">{name} {lastName}</div>
          <div className="text-[11px] text-muted-foreground">@{nick}</div>
          <div className="text-[11px]">{job || "—"}</div>
          <button type="button" onClick={()=>{logout(); location.href="/";}} className="btn btn-ghost w-full text-xs mt-2">خروج از حساب</button>
        </div>

        {/* form */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام</span>
              <input value={name} onChange={e=>setName(e.target.value)} className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام خانوادگی</span>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">نام کاربری</span>
              <input value={nick} onChange={e=>setNick(e.target.value)} className="input" dir="ltr" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">ایمیل</span>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" dir="ltr" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">سمت شغلی</span>
              <input value={job} onChange={e=>setJob(e.target.value)} placeholder="مثلا: کارشناس شبکه" className="input" />
            </label>
            <label className="text-xs space-y-1"><span className="text-muted-foreground">تاریخ تولد</span>
              <input type="date" value={birthday} onChange={e=>setBirthday(e.target.value)} className="input" />
            </label>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="font-bold text-sm">تغییر رمز عبور</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <input type="password" placeholder="رمز فعلی" className="input text-sm" />
              <input type="password" placeholder="رمز جدید" className="input text-sm" />
            </div>
            <p className="text-[11px] text-muted-foreground">دمو – در نسخه پروداکشن به /api/auth/change-password ارسال می‌شود.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <span className={`text-xs transition-opacity ${saved ? "opacity-100 text-[var(--tb-success)]" : "opacity-0"}`}>ذخیره شد ✓</span>
            <button className="btn btn-primary">ذخیره پروفایل</button>
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
              <div className="text-2xl font-black text-brand">{v}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{k}</div>
            </div>
          ))}
        </div>
      </form>
    </main>
  );
}

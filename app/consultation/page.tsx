import { Button } from "@/components/ui/Button";
export default function Consultation(){
 return (
 <main className="max-w-2xl mx-auto px-5 py-16" dir="rtl">
 <h1 className="tb-text-hero mb-4">درخواست مشاوره زیرساخت</h1>
 <div className="card p-6 space-y-4">
 <input className="input" placeholder="نام سازمان" />
 <input className="input" placeholder="تلفن" />
 <textarea className="input min-h-[120px]" placeholder="نیاز شما؟ سرور، شبکه، ذخیره‌سازی..." />
 <Button>ارسال درخواست</Button>
 </div>
 </main>
 )
}

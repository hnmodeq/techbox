"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth.provider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { toast } from "sonner";
import PageHeader from "@/components/effects/PageHeader";

const TYPE_LABELS: Record<string, string> = {
  content: "تولید کننده محتوایی (آبی)",
  org: "کاربر سازمانی (بنفش)",
  user: "کاربر عادی (زرد)",
};
const TYPE_BADGE: Record<string, "content" | "org" | "user"> = {
  content: "content",
  org: "org",
  user: "user",
};

type Request = {
  id: string;
  type: string;
  status: string;
  message: string;
  phone?: string;
  nationalId?: string;
  modules?: string[];
  orgName?: string;
  orgNationalId?: string;
  orgPosition?: string;
  orgApplicantName?: string;
  adminNote?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    verifiedType?: string;
  };
};

function RequestCard({ req, onReviewed }: { req: Request; onReviewed: () => void }) {
  const [adminNote, setAdminNote] = useState("");
  const [verifiedLabel, setVerifiedLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const review = async (decision: "approved" | "denied") => {
    if (decision === "denied" && !adminNote.trim()) {
      toast.error("لطفاً دلیل رد درخواست را بنویسید");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, decision, adminNote: adminNote.trim(), verifiedLabel: verifiedLabel.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(decision === "approved" ? "تایید شد" : "رد شد");
        onReviewed();
      } else {
        toast.error(data.error || "خطا");
      }
    } catch {
      toast.error("خطا در ارتباط");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-0" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border">
            <Image src={req.user.avatar || "/logo.png"} alt={req.user.name} fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold">
              {req.user.name}
              {req.user.verifiedType && (
                <VerifiedBadge type={req.user.verifiedType as any} size={14} />
              )}
            </div>
            <div className="text-xs text-muted-foreground" dir="ltr">@{req.user.username}</div>
          </div>
          <div className="mr-auto flex items-center gap-2">
            <Badge variant={TYPE_BADGE[req.type] === "content" ? "default" : "secondary"}>
              {TYPE_LABELS[req.type] || req.type}
            </Badge>
            <VerifiedBadge type={TYPE_BADGE[req.type] || "user"} size={16} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request details */}
        <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-2">
          <p><span className="font-semibold">پیام:</span> {req.message}</p>
          {req.phone && <p><span className="font-semibold">تلفن:</span> {req.phone}</p>}
          {req.nationalId && <p><span className="font-semibold">کد ملی:</span> {req.nationalId}</p>}
          {req.modules && req.modules.length > 0 && (
            <p><span className="font-semibold">ماژول‌ها:</span> {req.modules.join("، ")}</p>
          )}
          {req.orgName && <p><span className="font-semibold">نام سازمان:</span> {req.orgName}</p>}
          {req.orgNationalId && <p><span className="font-semibold">شناسه سازمان:</span> {req.orgNationalId}</p>}
          {req.orgApplicantName && <p><span className="font-semibold">نام متقاضی:</span> {req.orgApplicantName}</p>}
          {req.orgPosition && <p><span className="font-semibold">سمت:</span> {req.orgPosition}</p>}
          <p className="text-xs text-muted-foreground">
            {new Date(req.createdAt).toLocaleDateString("fa-IR")}
          </p>
        </div>

        {req.status === "pending" && (
          <div className="space-y-3">
            {req.type === "org" && (
              <div>
                <Label className="text-xs mb-1 block">برچسب تایید سازمانی (نمایش در tooltip)</Label>
                <Input
                  placeholder="مثلاً: کارشناس فناوری اطلاعات - بانک ملت"
                  value={verifiedLabel}
                  onChange={(e) => setVerifiedLabel(e.target.value)}
                  dir="rtl"
                />
              </div>
            )}
            <div>
              <Label className="text-xs mb-1 block">پیام به کاربر (الزامی در صورت رد)</Label>
              <Textarea
                placeholder="دلیل تایید یا رد را بنویسید..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                dir="rtl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() => review("approved")}
                className="flex-1"
              >
                تایید
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={busy}
                onClick={() => review("denied")}
                className="flex-1"
              >
                رد
              </Button>
            </div>
          </div>
        )}

        {req.status !== "pending" && (
          <div className={`rounded-lg p-3 text-sm ${req.status === "approved" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
            {req.status === "approved" ? "✅ تایید شده" : "❌ رد شده"}
            {req.adminNote && <p className="mt-1 text-xs">{req.adminNote}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminVerificationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState<Request[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loading && user && !["super_admin", "admin"].includes(user.role)) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const load = async (status: string) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/verification?status=${status}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  if (loading) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10" dir="rtl">
      <PageHeader colorVar="--admin" title="درخواست‌های تایید هویت" />

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList className="flex h-auto flex-wrap gap-1 mb-6">
          <TabsTrigger value="pending">در انتظار بررسی</TabsTrigger>
          <TabsTrigger value="approved">تایید شده</TabsTrigger>
          <TabsTrigger value="denied">رد شده</TabsTrigger>
          <TabsTrigger value="all">همه</TabsTrigger>
        </TabsList>

        {["pending", "approved", "denied", "all"].map((s) => (
          <TabsContent key={s} value={s}>
            {fetching ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-40 animate-pulse bg-muted" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">درخواستی وجود ندارد.</CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {requests.map((r) => (
                  <RequestCard key={r.id} req={r} onReviewed={() => load(tab)} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}

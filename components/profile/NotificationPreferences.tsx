"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Mail, MessageCircle, Heart, UserPlus } from "lucide-react";

type Prefs = {
  emailOnReply: boolean;
  emailOnFollow: boolean;
  emailOnLike: boolean;
  emailNewsletter: boolean;
  pushEnabled: boolean;
};

const DEFAULT_PREFS: Prefs = {
  emailOnReply: true,
  emailOnFollow: true,
  emailOnLike: false,
  emailNewsletter: true,
  pushEnabled: false,
};

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage (no DB model yet)
    try {
      const stored = localStorage.getItem("tb_notif_prefs");
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {}
    setLoading(false);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      localStorage.setItem("tb_notif_prefs", JSON.stringify(prefs));
      toast.success("تنظیمات اعلان‌ها ذخیره شد");
    } catch {
      toast.error("خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof Prefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="size-4" />
          تنظیمات اعلان‌ها
        </CardTitle>
        <CardDescription>انتخاب کنید چه زمانی اعلان دریافت کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">پاسخ به دیدگاه من</Label>
                <p className="text-[10px] text-muted-foreground">وقتی کسی به دیدگاه شما پاسخ دهد</p>
              </div>
            </div>
            <Switch checked={prefs.emailOnReply} onCheckedChange={(v) => update("emailOnReply", v)} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <UserPlus className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">دنبال‌کننده جدید</Label>
                <p className="text-[10px] text-muted-foreground">وقتی کسی شما را دنبال کند</p>
              </div>
            </div>
            <Switch checked={prefs.emailOnFollow} onCheckedChange={(v) => update("emailOnFollow", v)} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Heart className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">پسندیدن محتوای من</Label>
                <p className="text-[10px] text-muted-foreground">وقتی کسی مطلب شما را بپسندد</p>
              </div>
            </div>
            <Switch checked={prefs.emailOnLike} onCheckedChange={(v) => update("emailOnLike", v)} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <Label className="text-sm">خبرنامه هفتگی</Label>
                <p className="text-[10px] text-muted-foreground">دریافت خلاصه هفتگی محتوای جدید</p>
              </div>
            </div>
            <Switch checked={prefs.emailNewsletter} onCheckedChange={(v) => update("emailNewsletter", v)} />
          </div>
        </div>

        <Button onClick={save} loading={saving} disabled={saving || loading} className="w-full">
          ذخیره تنظیمات
        </Button>
      </CardContent>
    </Card>
  );
}

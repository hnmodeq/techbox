"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty } from "@/components/admin/admin-states";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PERMISSION_BUNDLES, type PermissionBundle } from "@/lib/permissions";
import { Shield, Plus, Trash2, Edit, Users, RefreshCw } from "lucide-react";

type Role = {
  id: string;
  name: string;
  nameFa: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  color: string | null;
  _count: { users: number };
  users: Array<{
    user: { id: string; name: string; username: string; avatar: string | null };
  }>;
};

// Group bundles by category
const BUNDLE_CATEGORIES = PERMISSION_BUNDLES.reduce(
  (acc, bundle) => {
    if (!acc[bundle.category]) acc[bundle.category] = [];
    acc[bundle.category].push(bundle);
    return acc;
  },
  {} as Record<string, PermissionBundle[]>
);

const CATEGORY_LABELS: Record<string, string> = {
  content: "محتوا",
  product: "محصولات",
  shop: "فروشگاه",
  communication: "ارتباطات",
  users: "کاربران",
  settings: "تنظیمات",
  system: "سیستم",
};

export default function RolesV2Page() {
  return (
    <AdminGuard superAdminOnly>
      {() => <RolesContent />}
    </AdminGuard>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formNameFa, setFormNameFa] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#3b82f6");
  const [formPermissions, setFormPermissions] = useState<Set<string>>(new Set());
  const [formBusy, setFormBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles-v2", { cache: "no-store" });
      const data = await res.json();
      setRoles(data.roles || []);
    } catch {
      toast.error("خطا در دریافت نقش‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingRole(null);
    setFormName("");
    setFormNameFa("");
    setFormDescription("");
    setFormColor("#3b82f6");
    setFormPermissions(new Set());
    setIsCreating(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormNameFa(role.nameFa);
    setFormDescription(role.description || "");
    setFormColor(role.color || "#3b82f6");
    setFormPermissions(new Set(role.permissions));
    setIsCreating(true);
  };

  const toggleBundle = (bundle: PermissionBundle) => {
    setFormPermissions((prev) => {
      const next = new Set(prev);
      const allPresent = bundle.permissions.every((p) => next.has(p));
      if (allPresent) {
        bundle.permissions.forEach((p) => next.delete(p));
      } else {
        bundle.permissions.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  const saveRole = async () => {
    if (!formNameFa.trim()) {
      toast.error("نام فارسی الزامی است");
      return;
    }
    setFormBusy(true);
    try {
      const payload = {
        name: formName.trim() || formNameFa.trim().replace(/\s+/g, "_").toLowerCase(),
        nameFa: formNameFa.trim(),
        description: formDescription.trim() || null,
        permissions: Array.from(formPermissions),
        color: formColor,
      };

      if (editingRole) {
        const res = await fetch("/api/admin/roles-v2", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingRole.id, ...payload }),
        });
        if (res.ok) toast.success("نقش ویرایش شد");
        else toast.error("خطا در ویرایش");
      } else {
        const res = await fetch("/api/admin/roles-v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) toast.success("نقش ایجاد شد");
        else toast.error("خطا در ایجاد");
      }
      setIsCreating(false);
      load();
    } catch {
      toast.error("خطا در ارتباط");
    } finally {
      setFormBusy(false);
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm("حذف این نقش؟ کاربران این نقش را از دست می‌دهند.")) return;
    try {
      const res = await fetch(`/api/admin/roles-v2?id=${id}`, { method: "DELETE" });
      if (res.ok) toast.success("نقش حذف شد");
      else toast.error("خطا در حذف");
      load();
    } catch {
      toast.error("خطا");
    }
  };

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="size-5" />
            مدیریت نقش‌ها و دسترسی‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {roles.length} نقش تعریف شده
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="size-3" />
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="size-3" />
            نقش جدید
          </Button>
        </div>
      </div>

      {loading ? (
        <AdminLoading rows={4} />
      ) : roles.length === 0 ? (
        <AdminEmpty title="هنوز نقشی تعریف نشده" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: role.color || "#3b82f6" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{role.nameFa}</div>
                    <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">{role.name}</div>
                  </div>
                  {role.isSystem && <Badge variant="secondary" className="text-[9px]">سیستم</Badge>}
                </div>
                {role.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{role.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  <span>{role._count.users.toLocaleString("fa-IR")} کاربر</span>
                  <span>·</span>
                  <span>{role.permissions.length.toLocaleString("fa-IR")} دسترسی</span>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="outline" onClick={() => openEdit(role)} className="flex-1 gap-1">
                    <Edit className="size-3" />
                    ویرایش
                  </Button>
                  {!role.isSystem && (
                    <Button size="xs" variant="ghost" onClick={() => deleteRole(role.id)} className="text-destructive">
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating} onOpenChange={(o) => { if (!o) setIsCreating(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingRole ? `ویرایش: ${editingRole.nameFa}` : "ایجاد نقش جدید"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">نام فارسی *</Label>
                <Input value={formNameFa} onChange={(e) => setFormNameFa(e.target.value)} placeholder="مثلاً: تولید محتوا" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">نام انگلیسی</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="auto از فارسی" dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">توضیحات</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="توضیحات نقش..." className="min-h-[60px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">رنگ</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="size-8 rounded border" />
                <Input value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-32 font-mono text-xs" dir="ltr" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-xs font-bold">دسترسی‌ها (بسته‌های مجوز)</Label>
              <p className="text-[10px] text-muted-foreground">
                هر بسته شامل چند مجوز مرتبط است. تیک بزنید تا دسترسی فعال شود.
              </p>
              {Object.entries(BUNDLE_CATEGORIES).map(([category, bundles]) => (
                <div key={category} className="space-y-2">
                  <div className="text-xs font-bold text-foreground">{CATEGORY_LABELS[category] || category}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {bundles.map((bundle) => {
                      const allSelected = bundle.permissions.every((p) => formPermissions.has(p));
                      const someSelected = bundle.permissions.some((p) => formPermissions.has(p));
                      return (
                        <Label
                          key={bundle.id}
                          className={`flex items-start gap-2 rounded-md border p-2.5 cursor-pointer transition-colors ${
                            allSelected
                              ? "border-primary/40 bg-primary/5"
                              : someSelected
                                ? "border-primary/20 bg-primary/2"
                                : "hover:bg-muted/30"
                          }`}
                        >
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => toggleBundle(bundle)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium">{bundle.nameFa}</div>
                            <div className="text-[10px] text-muted-foreground line-clamp-1">{bundle.description}</div>
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>انصراف</Button>
            <Button onClick={saveRole} disabled={formBusy} loading={formBusy}>
              {editingRole ? "ذخیره" : "ایجاد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

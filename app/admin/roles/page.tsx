"use client";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading } from "@/components/admin/admin-states";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { ModuleBadge } from "@/components/ui/module-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface RoleRow {
  name: string;
  titleFa: string;
  modules: string[];
  userCount: number;
  users: { id: string; name: string; username: string; avatar: string | null; modules: string[] }[];
}

interface EditingUser {
  userId: string;
  role: string;
  modules: string[];
}

export default function RolesPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <RolesContent />}
    </AdminGuard>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load roles");
      }
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (e: any) {
      setError(e.message || "خطا در بارگذاری نقش‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const allMods = Object.keys(moduleMeta) as ModuleSlug[];
  const totalAssignments = roles.reduce((sum, role) => sum + role.modules.length, 0);

  const startEdit = (roleName: string, user: { id: string; name: string; username: string; avatar: string | null; modules: string[] }) => {
    setEditingUser({ userId: user.id, role: roleName, modules: [...user.modules] });
    setMsg("");
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setMsg("");
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setMsg("");
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.userId,
          role: editingUser.role,
          modules: editingUser.modules,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "خطا در ذخیره");
      }
      setMsg("تغییرات با موفقیت ذخیره شد.");
      setEditingUser(null);
      fetchRoles();
    } catch (e: any) {
      setMsg(e.message || "خطا در ذخیره");
    }
  };

  const toggleModule = (m: ModuleSlug) => {
    if (!editingUser) return;
    const mods = editingUser.modules.includes(m) ? editingUser.modules.filter((x) => x !== m) : [...editingUser.modules, m];
    setEditingUser({ ...editingUser, modules: mods });
  };

  if (loading) {
    return (
      <main className="p-4 md:p-6" dir="rtl">
        <AdminLoading rows={3} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-4" dir="rtl">
        <p className="text-sm text-destructive">{error}</p>
        <Button onClick={fetchRoles} size="sm">تلاش مجدد</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">مدیریت نقش‌ها – RBAC</h1>
          <p className="mt-1 text-sm text-muted-foreground">مدیر کل می‌تواند نقش و دسترسی ماژول کاربران را مدیریت کند. داده‌ها از دیتابیس واقعی خوانده می‌شوند.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ModuleBadge module="success">super_admin only</ModuleBadge>
          <Button variant="ghost" size="sm" onClick={fetchRoles}>بازنشانی</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground">کل نقش‌ها</div><div className="mt-1 text-xl font-bold">{roles.length.toLocaleString("fa-IR")}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">کل کاربران فعال</div><div className="mt-1 text-xl font-bold">{roles.reduce((s, r) => s + r.userCount, 0).toLocaleString("fa-IR")}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">دسترسی ماژولی</div><div className="mt-1 text-xl font-bold">{totalAssignments.toLocaleString("fa-IR")}</div></Card>
      </div>

      {roles.map((role) => (
        <Card key={role.name} className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-base">{role.titleFa}</CardTitle>
              <Badge variant="secondary">{role.name}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{role.userCount.toLocaleString("fa-IR")} کاربر</span>
          </CardHeader>
          <CardContent className="p-4 border-b">
            <div className="text-xs text-muted-foreground mb-2">ماژول‌های قابل دسترسی:</div>
            <div className="flex flex-wrap gap-1">
              {role.modules.length > 0 ? (
                role.modules.map((m) => <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>)
              ) : (
                <span className="text-xs text-muted-foreground">بدون دسترسی ماژولی</span>
              )}
            </div>
          </CardContent>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">نام کاربری</TableHead>
                  <TableHead className="text-right">ماژول‌ها</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {role.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell className="font-mono text-xs" dir="ltr">{u.username}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.modules.map((m) => (
                          <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
                        ))}
                        {u.modules.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="xs" onClick={() => startEdit(role.name, u)}>ویرایش</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && cancelEdit()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>ویرایش نقش کاربر</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>نقش</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({ ...editingUser, role: v as string })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">مدیر کل (super_admin)</SelectItem>
                    <SelectItem value="editor">ویراستار (editor)</SelectItem>
                    <SelectItem value="user">کاربر عضو (user)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>دسترسی ماژول‌ها</Label>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="xs" onClick={() => setEditingUser({ ...editingUser, modules: allMods.slice() })}>همه</Button>
                    <Button type="button" variant="ghost" size="xs" className="text-destructive" onClick={() => setEditingUser({ ...editingUser, modules: [] })}>پاک</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allMods.map((m) => (
                    <Label key={m} className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 ${editingUser.modules.includes(m) ? "border-primary/40 bg-primary/10" : "border-border hover:bg-muted"}`}>
                      <Checkbox checked={editingUser.modules.includes(m)} onCheckedChange={() => toggleModule(m)} />
                      <ModuleBadge module={m}>{moduleMeta[m].titleFa}</ModuleBadge>
                    </Label>
                  ))}
                </div>
              </div>

              {msg && <p className={`text-sm ${msg.includes("خطا") ? "text-destructive" : "text-green-600"}`}>{msg}</p>}

              <DialogFooter className="flex gap-2">
                <Button onClick={saveEdit}>ذخیره</Button>
                <Button variant="ghost" onClick={cancelEdit}>انصراف</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

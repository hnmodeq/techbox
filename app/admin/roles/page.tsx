"use client";
import { useEffect, useState } from "react";
import { moduleMeta, type ModuleSlug } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { ModuleBadge } from "@/components/ui/module-badge";
import { Badge } from "@/components/ui/badge";

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
    const mods = editingUser.modules.includes(m)
      ? editingUser.modules.filter((x) => x !== m)
      : [...editingUser.modules, m];
    setEditingUser({ ...editingUser, modules: mods });
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
        <p className="paragraph-color">در حال بارگذاری...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
        <p className="text-[var(--danger)]">{error}</p>
        <Button onClick={fetchRoles} className="mt-4">تلاش مجدد</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold">مدیریت نقش‌ها – RBAC</h1>
          <p className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">مدیر کل می‌تواند نقش و دسترسی ماژول کاربران را مدیریت کند. داده‌ها از دیتابیس واقعی خوانده می‌شوند.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ModuleBadge module="success">super_admin only</ModuleBadge>
          <Button variant="ghost" size="xs" onClick={fetchRoles}>بازنشانی</Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-3">
          <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">کل نقش‌ها</div>
          <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">{roles.length.toLocaleString("fa-IR")}</div>
        </div>
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-3">
          <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">کل کاربران فعال</div>
          <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">{roles.reduce((s, r) => s + r.userCount, 0).toLocaleString("fa-IR")}</div>
        </div>
        <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] p-3">
          <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسترسی ماژولی</div>
          <div className="mt-1 text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">{totalAssignments.toLocaleString("fa-IR")}</div>
        </div>
      </div>

      {/* Roles from DB */}
      {roles.map((role) => (
        <div key={role.name} className="mb-6 bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 p-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold">{role.titleFa}</h2>
              <Badge variant="secondary">{role.name}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">{role.userCount.toLocaleString("fa-IR")} کاربر</span>
            </div>
          </div>

          {/* Module badges for this role */}
          <div className="border-b border-[var(--border-color)]/30 p-4">
            <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-2">ماژول‌های قابل دسترسی:</div>
            <div className="flex flex-wrap gap-1">
              {role.modules.length > 0 ? role.modules.map((m) => (
                <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
              )) : <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">بدون دسترسی ماژولی</span>}
            </div>
          </div>

          {/* Users in this role */}
          <div className="p-4">
            <table className="w-full text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">
              <thead>
                <tr className="border-b border-[var(--border-color)]/30">
                  <th className="p-2 text-right">نام</th>
                  <th className="p-2 text-right">نام کاربری</th>
                  <th className="p-2 text-right">ماژول‌ها</th>
                  <th className="p-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {role.users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border-color)]/20">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2 font-mono text-sm" dir="ltr">{u.username}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {u.modules.map((m) => (
                          <ModuleBadge key={m} module={m as ModuleSlug}>{moduleMeta[m as ModuleSlug]?.titleFa || m}</ModuleBadge>
                        ))}
                        {u.modules.length === 0 && <span className="paragraph-color">—</span>}
                      </div>
                    </td>
                    <td className="p-2">
                      <Button variant="link" size="xs" className="text-[var(--home)]" onClick={() => startEdit(role.name, u)}>
                        ویرایش
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Edit modal/panel */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={cancelEdit}>
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--corner-radius)] bg-[var(--card-background)] text-[var(--primary-text)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mb-4">ویرایش نقش کاربر</h3>

            <div className="mb-4">
              <label className="block text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color mb-1">نقش</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="input w-full"
              >
                <option value="super_admin">مدیر کل (super_admin)</option>
                <option value="editor">ویراستار (editor)</option>
                <option value="user">کاربر عضو (user)</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">دسترسی ماژول‌ها</label>
                <div className="flex gap-1">
                  <Button type="button" variant="link" size="xs" onClick={() => setEditingUser({ ...editingUser, modules: allMods.slice() })}>همه</Button>
                  <Button type="button" variant="link" size="xs" className="text-[var(--danger)]" onClick={() => setEditingUser({ ...editingUser, modules: [] })}>پاک</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {allMods.map((m) => (
                  <label key={m} className={`flex cursor-pointer items-center gap-2 rounded-[var(--corner-radius)] border p-2 transition-colors ${editingUser.modules.includes(m) ? "border-[color-mix(in_oklch,var(--home)_40%,transparent)] bg-[color-mix(in_oklch,var(--home)_10%,transparent)]" : "border-[var(--border-color)] hover:bg-[var(--muted-background)]"}`}>
                    <input
                      type="checkbox"
                      checked={editingUser.modules.includes(m)}
                      onChange={() => toggleModule(m)}
                    />
                    <ModuleBadge module={m}>{moduleMeta[m].titleFa}</ModuleBadge>
                  </label>
                ))}
              </div>
            </div>

            {msg && <p className={`mb-3 text-sm ${msg.includes("خطا") ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{msg}</p>}

            <div className="flex gap-2">
              <Button onClick={saveEdit}>ذخیره</Button>
              <Button variant="ghost" onClick={cancelEdit}>انصراف</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

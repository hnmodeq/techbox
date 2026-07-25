import { redirect } from "next/navigation";

// The legacy single-role/module editor has been retired. Role/UserRole is the
// only staff authorization model.
export default function LegacyRolesPage() {
  redirect("/admin/roles-v2");
}

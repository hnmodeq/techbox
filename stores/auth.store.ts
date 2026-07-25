// Backwards-compatible type/helper exports. Session state lives exclusively in
// AuthProvider and is loaded from /api/auth/me.
export { canEdit, canView, type AppUser } from "@/lib/auth";

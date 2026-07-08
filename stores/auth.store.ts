// client auth store – thin wrapper over lib/auth – keeps stores/ boundary clean
export { login, logout, getCurrentUserClient, canEdit, type AppUser } from "@/lib/auth";

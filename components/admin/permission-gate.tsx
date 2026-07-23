"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { ReactNode } from "react";

/**
 * Permission-based section gate.
 * Shows children only if user has the required permission.
 * If `readOnly` prop is true, shows children in read-only mode.
 *
 * Usage:
 *   <PermissionGate permission="product:price:edit">
 *     <PriceSection />
 *   </PermissionGate>
 *
 *   <PermissionGate permission="product:price:view" readOnly>
 *     <PriceSection disabled />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { has, loading } = usePermissions();

  if (loading) return null;
  if (!has(permission)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Wrapper that shows a read-only badge when user only has view permission.
 */
export function PermissionSection({
  viewPermission,
  editPermission,
  title,
  children,
}: {
  viewPermission: string;
  editPermission: string;
  title: string;
  children: (props: { canEdit: boolean }) => ReactNode;
}) {
  const { has, loading } = usePermissions();

  if (loading) return null;
  if (!has(viewPermission)) return null;

  const canEdit = has(editPermission);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        {!canEdit && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
            فقط خواندنی
          </span>
        )}
      </div>
      {children({ canEdit })}
    </div>
  );
}

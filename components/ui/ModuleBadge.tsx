import * as React from "react";
import { Badge, type BadgeProps } from "./Badge";
import type { ModuleSlug } from "@/lib/content";

type ModuleBadgeVariant = ModuleSlug | "home" | "raid" | "subnet" | "vip" | "success" | "warning" | "danger" | "info";

export interface ModuleBadgeProps extends Omit<BadgeProps, "variant"> {
 module: ModuleBadgeVariant;
}

export function ModuleBadge({ module, ...props }: ModuleBadgeProps) {
 return <Badge variant={module as BadgeProps["variant"]} {...props} />;
}

export default ModuleBadge;

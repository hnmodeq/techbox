"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleMeta } from "@/lib/content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = {
  label: string;
  href?: string;
};

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "خانه" }];

  const crumbs: Crumb[] = [{ label: "خانه", href: "/" }];
  let accumulated = "";

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    accumulated += `/${part}`;

    // Try to map module slug to Fa title
    // @ts-expect-error dynamic
    const meta = moduleMeta[part];
    if (meta) {
      crumbs.push({ label: meta.titleFa || meta.title || part, href: accumulated });
    } else {
      // decode slug: replace - with space, capitalize? For now show part
      const label = decodeURIComponent(part).replace(/-/g, " ");
      // last item no href
      if (i === parts.length - 1) {
        crumbs.push({ label });
      } else {
        crumbs.push({ label, href: accumulated });
      }
    }
  }

  return crumbs;
}

export function PageBreadcrumb({ customCrumbs }: { customCrumbs?: Crumb[] }) {
  const pathname = usePathname();
  const crumbs = customCrumbs || buildCrumbs(pathname);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <div key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href}>{crumb.label}</Link>} />
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default PageBreadcrumb;

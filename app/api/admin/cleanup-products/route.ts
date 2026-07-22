import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserPublic } from "@/lib/auth-server";

// Required 18 spec keys (Persian) that all products must have
const REQUIRED_SPEC_KEYS = [
  "پردازنده",
  "حافظه رم",
  "حداکثر حافظه",
  "تعداد جایگاه دیسک",
  "سازگاری درایو",
  "اسلات M.2",
  "پورت 2.5 گیگ",
  "اسلات توسعه PCIe",
  "فرم فاکتور",
  "منبع تغذیه",
  "مصرف برق معمولی",
  "گارانتی استاندارد",
  "فن",
  "سیستم عامل",
  "انواع RAID پشتیبانی شده",
  "حداکثر ظرفیت Pool",
  "نوع Volume",
  "حداکثر اتصالات همزمان",
  "حداکثر ظرفیت Volume",
];

// Map English QNAP keys to the 18 required Persian keys
const ENGLISH_TO_PERSIAN: Record<string, string> = {
  "CPU": "پردازنده",
  "System Memory": "حافظه رم",
  "Maximum Memory": "حداکثر حافظه",
  "Drive Bay": "تعداد جایگاه دیسک",
  "Drive Compatibility": "سازگاری درایو",
  "M.2 Slot": "اسلات M.2",
  "2.5 Gigabit Ethernet Port (2.5G/1G/100M)": "پورت 2.5 گیگ",
  "2.5 Gigabit Ethernet Port": "پورت 2.5 گیگ",
  "PCIe Slot": "اسلات توسعه PCIe",
  "Form Factor": "فرم فاکتور",
  "Power Supply Unit": "منبع تغذیه",
  "Power Consumption: Operating Mode, Typical": "مصرف برق معمولی",
  "Standard Warranty": "گارانتی استاندارد",
  "Fan": "فن",
  "Operating System": "سیستم عامل",
  "RAID Type": "انواع RAID پشتیبانی شده",
  "Maximum Pool size": "حداکثر ظرفیت Pool",
  "Volume Type": "نوع Volume",
  "Maximum Number of Concurrent Connections (CIFS) - with Max. Memory": "حداکثر اتصالات همزمان",
  "Max. Number of Concurrent Connections (CIFS) - with Max. Memory": "حداکثر اتصالات همزمان",
  "Maximum volume size": "حداکثر ظرفیت Volume",
};

function normalizeSpecs(specs: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(specs)) {
    if (!value || String(value).trim() === "") continue;
    const val = String(value).trim();
    if (["n/a", "na", "-"].includes(val.toLowerCase())) continue;

    // Check if it's an English key that maps to Persian
    const persianKey = ENGLISH_TO_PERSIAN[key];
    if (persianKey) {
      result[persianKey] = val;
    }
    // If it's already a Persian key we want, keep it
    else if (REQUIRED_SPEC_KEYS.includes(key)) {
      result[key] = val;
    }
    // Skip all other specs (we only want the 18)
  }

  return result;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUserPublic();
  if (!user || (user.role !== "super_admin" && user.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { dryRun = false, deleteOlderThanDays = 2, cleanSpecs = true, deleteIncomplete = true } = body;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - deleteOlderThanDays);

  const results = {
    deletedOld: 0,
    deletedIncomplete: 0,
    specsNormalized: 0,
    specsDeleted: 0,
    errors: [] as string[],
  };

  try {
    // 1. Delete old products (older than cutoff)
    const oldProducts = await prisma.post.findMany({
      where: {
        module: "shop",
        date: { lt: cutoffDate },
        deletedAt: null,
      },
      select: { id: true, slug: true, title: true, date: true },
    });

    if (!dryRun && oldProducts.length > 0) {
      await prisma.post.deleteMany({
        where: { id: { in: oldProducts.map((p) => p.id) } },
      });
    }
    results.deletedOld = oldProducts.length;

    // 2. Get remaining products
    const remaining = await prisma.post.findMany({
      where: {
        module: "shop",
        deletedAt: null,
      },
    });

    // 3. Clean specs - normalize to 18 required keys
    if (cleanSpecs) {
      for (const product of remaining) {
        const rawSpecs = (product.specs as Record<string, unknown>) || {};
        const normalized = normalizeSpecs(rawSpecs);
        const hadSpecs = Object.keys(rawSpecs).length;
        const hasNow = Object.keys(normalized).length;

        if (hadSpecs !== hasNow || JSON.stringify(rawSpecs) !== JSON.stringify(normalized)) {
          if (!dryRun) {
            await prisma.post.update({
              where: { id: product.id },
              data: { specs: Object.keys(normalized).length > 0 ? normalized : null },
            });
          }
          results.specsNormalized++;
          results.specsDeleted += Math.max(0, hadSpecs - hasNow);
        }
      }
    }

    // 4. Delete products with no specs at all
    if (deleteIncomplete) {
      const noSpecs = remaining.filter((p) => {
        const specs = (p.specs as Record<string, unknown>) || {};
        const normalized = normalizeSpecs(specs);
        return Object.keys(normalized).length === 0;
      });

      if (!dryRun && noSpecs.length > 0) {
        await prisma.post.deleteMany({
          where: { id: { in: noSpecs.map((p) => p.id) } },
        });
      }
      results.deletedIncomplete = noSpecs.length;
    }
  } catch (e: any) {
    results.errors.push(e.message || String(e));
  }

  return NextResponse.json({ ...results, dryRun, cutoffDate: cutoffDate.toISOString() });
}

export const dynamic = "force-dynamic";

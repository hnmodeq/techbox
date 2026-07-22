"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type SpecOption = { value: string; label: string };

type SpecFieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type: "text" | "select" | "toggle";
  options?: SpecOption[];
  isCardSpec?: boolean; // shown on product card
};

const SPEC_FIELDS: SpecFieldDef[] = [
  { key: "CPU", label: "CPU / پردازنده", placeholder: "Intel Xeon D-2123IT 4-core 3.0GHz", type: "text", isCardSpec: true },
  { key: "RAM", label: "RAM / حافظه", placeholder: "32GB DDR4 ECC", type: "text", isCardSpec: true },
  { key: "Bay", label: "Bay / تعداد جایگاه دیسک", type: "select", options: ["1 Bay","2 Bay","4 Bay","6 Bay","8 Bay","12 Bay","16 Bay","24 Bay","36 Bay"].map(v => ({ value: v, label: v })), isCardSpec: true },
  { key: "Network Card", label: "کارت شبکه (Network Card)", type: "select", options: ["1GbE","2.5GbE","10GbE","25GbE","40GbE","10GbE SFP+","25GbE SFP28"].map(v => ({ value: v, label: v })), isCardSpec: true },
  { key: "Form Factor", label: "سازگاری درایو", placeholder: '3.5" / 2.5" SATA / SAS / NVMe', type: "text" },
  { key: "اسلات M.2", label: "اسلات M.2", placeholder: "2x M.2 NVMe", type: "text" },
  { key: "پورت 2.5 گیگ", label: "پورت 2.5 گیگابیت", type: "select", options: [{ value: "0", label: "ندارد" }, { value: "1", label: "1 پورت" }, { value: "2", label: "2 پورت" }, { value: "4", label: "4 پورت" }] },
  { key: "اسلات توسعه PCIe", label: "اسلات توسعه PCIe", placeholder: "2x PCIe 4.0 x8", type: "text" },
  { key: "فرم فاکتور", label: "فرم فاکتور", type: "select", options: ["Tower","Desktop","Rackmount 1U","Rackmount 2U","Rackmount 3U","Rackmount 4U","Short-depth 1U","Short-depth 2U"].map(v => ({ value: v, label: v })) },
  { key: "منبع تغذیه", label: "منبع تغذیه", placeholder: "750W Redundant", type: "text" },
  { key: "مصرف برق معمولی", label: "مصرف برق معمولی", placeholder: "350W", type: "text" },
  { key: "گارانتی استاندارد", label: "گارانتی استاندارد", placeholder: "۳۶ ماه", type: "text" },
  { key: "فن", label: "فن", placeholder: "4x Hot-swap 40mm", type: "text" },
  { key: "سیستم عامل", label: "سیستم عامل", placeholder: "DSM / QTS / TrueNAS", type: "text" },
  { key: "انواع RAID پشتیبانی شده", label: "انواع RAID پشتیبانی شده", placeholder: "RAID 0,1,5,6,10", type: "text" },
  { key: "حداکثر ظرفیت Pool", label: "حداکثر ظرفیت Pool", placeholder: "200TB", type: "text" },
  { key: "نوع Volume", label: "نوع Volume", placeholder: "Thick / Thin / Hybrid", type: "text" },
  { key: "حداکثر اتصالات همزمان", label: "حداکثر اتصالات همزمان", placeholder: "500", type: "text" },
  { key: "حداکثر ظرفیت Volume", label: "حداکثر ظرفیت Volume", placeholder: "108TB", type: "text" },
  { key: "ارسال سریع", label: "ارسال سریع", type: "toggle" },
];

function parseSpecsObj(specsStr: string): Record<string, string> {
  try { return JSON.parse(specsStr); } catch { return {}; }
}

function updateSpec(specsStr: string, key: string, value: string): string {
  const obj = parseSpecsObj(specsStr);
  if (value.trim()) obj[key] = value;
  else delete obj[key];
  return JSON.stringify(obj, null, 2);
}

function toggleSpec(specsStr: string, key: string, on: boolean): string {
  const obj = parseSpecsObj(specsStr);
  if (on) obj[key] = "دارد";
  else delete obj[key];
  return JSON.stringify(obj, null, 2);
}

export function ShopSpecsField({
  specsStr,
  onChange,
}: {
  specsStr: string;
  onChange: (next: string) => void;
}) {
  const specsObj = parseSpecsObj(specsStr);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {SPEC_FIELDS.map((field) => {
        const value = specsObj[field.key] || "";

        if (field.type === "toggle") {
          return (
            <div key={field.key} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-xs font-medium">{field.label}</div>
                <div className="text-[11px] text-muted-foreground">آیا این محصول {field.label} دارد؟</div>
              </div>
              <Switch
                checked={value === "دارد"}
                onCheckedChange={(checked) => onChange(toggleSpec(specsStr, field.key, checked))}
              />
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.key}>
              <Label className="text-xs font-medium text-muted-foreground">
                {field.label}
                {field.isCardSpec && <span className="text-[10px] ms-1 text-primary">(روی کارت)</span>}
              </Label>
              <Select
                value={value || ""}
                onValueChange={(v) => onChange(updateSpec(specsStr, field.key, v ?? ""))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="انتخاب..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        // text type
        return (
          <div key={field.key}>
            <Label className="text-xs font-medium text-muted-foreground">
              {field.label}
              {field.isCardSpec && <span className="text-[10px] ms-1 text-primary">(روی کارت)</span>}
            </Label>
            <Input
              dir="ltr"
              placeholder={field.placeholder}
              className="mt-1"
              value={value}
              onChange={(e) => onChange(updateSpec(specsStr, field.key, e.target.value))}
            />
          </div>
        );
      })}
    </div>
  );
}

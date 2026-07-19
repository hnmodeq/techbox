"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@/design/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { NvrFilterState, NvrModel } from "./nvr-selector-data";
import { defaultNvrFilter, estimateNvrStorageTb, nvrResolutions } from "./nvr-selector-data";

type NvrSelectorProps = {
  products: NvrModel[];
  initialFilters?: Partial<NvrFilterState>;
  onSelect?: (model: NvrModel, filters: NvrFilterState) => void;
  consultationHref?: string;
  className?: string;
};

const fa = new Intl.NumberFormat("fa-IR");

export function NvrSelector({
  products,
  initialFilters,
  onSelect,
  consultationHref = "/consultation",
  className,
}: NvrSelectorProps) {
  const [filters, setFilters] = useState<NvrFilterState>({ ...defaultNvrFilter, ...initialFilters });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const filteredModels = useMemo(() => {
    return products
      .filter((model) => {
        const meetsCameras = model.maxCameras >= filters.cameras;
        const meetsAI = !filters.aiEnabled || model.aiFeatures;
        return meetsCameras && meetsAI;
      })
      .sort((a, b) => a.maxCameras - b.maxCameras);
  }, [products, filters]);

  const recommendedModel = filteredModels[0];
  const storageTB = estimateNvrStorageTb(filters.cameras, filters.resolution, filters.days);

  const handleFilterChange = <K extends keyof NvrFilterState>(key: K, value: NvrFilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSelectedModel(null);
  };

  const renderPrice = (model: NvrModel) => {
    if (!model.price || model.price === "مشاوره خرید") {
      return "مشاوره خرید";
    }
    if (typeof model.price === "number") {
      return `${fa.format(model.price)} تومان`;
    }
    return `${model.price} تومان`;
  };

  return (
    <div className={["w-full max-w-[1100px] mx-auto", className].filter(Boolean).join(" ")} dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center">
        <Badge
          variant="outline"
          className="mb-3 border-[color-mix(in_oklch,var(--nvr)_35%,var(--border))] bg-[color-mix(in_oklch,var(--nvr)_12%,transparent)] text-[var(--nvr)]"
        >
          <Icon name="nvr" className="w-3.5 h-3.5" />
          ماژول انتخاب ان‌وی‌آر
        </Badge>
        <h2 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-2">انتخابگر ان‌وی‌آر</h2>
        <p className="paragraph-color max-w-md mx-auto text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
          تعداد دوربین، رزولوشن و مدت زمان ضبط را مشخص کنید تا بهترین مدل‌های موجود در فروشگاه را پیدا کنید
        </p>
      </div>

      {/* Stack layout: tool options top, results below */}
      <div className="flex flex-col gap-8">
        {/* Filters Panel */}
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="tools" className="w-5 h-5 text-[var(--home)]" />
            <h3 className="font-black text-[17px]">مشخصات مورد نیاز پروژه</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {/* Cameras Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label className="text-[13px] font-extrabold">تعداد دوربین‌ها</Label>
                <div className="font-black text-[20px] tabular-nums text-[var(--home)]">
                  {fa.format(filters.cameras)} عدد
                </div>
              </div>
              <Slider
                value={[filters.cameras]}
                onValueChange={(v: any) => handleFilterChange("cameras", Array.isArray(v) ? v[0] : v)}
                min={1}
                max={64}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] paragraph-color">
                <span>۱ دوربین</span>
                <span>۶۴ دوربین</span>
              </div>
            </div>

            {/* Recording Days Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label className="text-[13px] font-extrabold">مدت زمان ضبط پیوسته</Label>
                <div className="font-black text-[20px] tabular-nums text-[var(--home)]">
                  {fa.format(filters.days)} روز
                </div>
              </div>
              <Slider
                value={[filters.days]}
                onValueChange={(v: any) => handleFilterChange("days", Array.isArray(v) ? v[0] : v)}
                min={7}
                max={90}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] paragraph-color">
                <span>۷ روز</span>
                <span>۹۰ روز</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-7 items-center">
            {/* Resolution Buttons */}
            <div>
              <Label className="block text-[13px] font-extrabold mb-2.5">رزولوشن میانگین دوربین‌ها</Label>
              <div className="flex flex-wrap gap-2">
                {nvrResolutions.map((res) => (
                  <Button
                    key={res}
                    variant={filters.resolution === res ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleFilterChange("resolution", res)}
                    className="font-bold"
                  >
                    {res}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Toggle */}
            <Card className="border-border/60 bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-[14px]">تحلیل هوش مصنوعی و آنالیتیک</div>
                  <div className="text-[12px] paragraph-color mt-0.5">تشخیص چهره، پلاک و رویدادهای هوشمند</div>
                </div>
                <Switch
                  checked={filters.aiEnabled}
                  onCheckedChange={(checked) => handleFilterChange("aiEnabled", checked)}
                />
              </div>
            </Card>
          </div>

          {/* Storage Estimate Footer */}
          <Separator className="my-6" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="paragraph-color text-[13px]">حجم ذخیره‌سازی تخمینی پروژه:</span>
              <span className="font-black tabular-nums text-[20px] text-[var(--nvr)]">
                {fa.format(storageTB)} <span className="text-[12px] font-semibold paragraph-color">ترابایت</span>
              </span>
            </div>
            <Button variant="outline" onClick={() => { window.location.href = consultationHref; }}>
              مشاوره تخصصی زیرساخت نظارت تصویری
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <span className="font-black text-[18px]">مدل‌های NVR پیشنهادی فروشگاه</span>
              <span className="text-[13px] paragraph-color mr-2">({fa.format(filteredModels.length)} مدل موجود)</span>
            </div>
            {recommendedModel && (
              <Badge variant="outline" className="border-[color-mix(in_oklch,var(--success)_40%,var(--border))] bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[var(--success)]">
                <Icon name="check" className="w-3.5 h-3.5" /> بهترین انتخاب برای این پروژه
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const isRecommended = model.id === recommendedModel?.id;
                const isSelected = selectedModel === model.id;
                const targetHref = model.shopSlug ? `/shop/${model.shopSlug}` : model.href || `/shop/${model.id}`;

                return (
                  <Card
                    key={model.id}
                    className={`p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                      isSelected ? "ring-2 ring-primary" : ""
                    } ${isRecommended ? "border-[color-mix(in_oklch,var(--nvr)_45%,var(--border))]" : ""}`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-[17px] text-foreground">{model.nameFa}</div>
                          <div className="text-[12px] paragraph-color mt-0.5">{model.name}</div>
                        </div>
                        {isRecommended && (
                          <Badge variant="outline" className="border-[color-mix(in_oklch,var(--success)_35%,var(--border))] bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[var(--success)]">پیشنهادی</Badge>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[12px]">
                        <div className="rounded-md bg-muted p-2">
                          <div className="paragraph-color text-[11px]">حداکثر دوربین</div>
                          <div className="font-extrabold tabular-nums mt-0.5">{fa.format(model.maxCameras)} کانال</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="paragraph-color text-[11px]">بِی هارد دیسک</div>
                          <div className="font-extrabold mt-0.5">{fa.format(model.storageBays)} بِی</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="paragraph-color text-[11px]">رزولوشن</div>
                          <div className="font-extrabold mt-0.5">{model.maxResolution}</div>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <div className="paragraph-color text-[11px]">پشتیبانی RAID</div>
                          <div className="font-extrabold mt-0.5">{model.raidSupport}</div>
                        </div>
                      </div>

                      <p className="mt-4 text-[13px] paragraph-color leading-6">{model.descriptionFa}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[15px] font-black text-[var(--primary)]">
                        {renderPrice(model)}
                      </div>

                      <Button variant="secondary" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); window.location.href = targetHref; }}>
                        مشاهده در فروشگاه
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8 text-center md:col-span-2">
                <p className="paragraph-color font-bold">مدلی با این مشخصات پیدا نشد.</p>
                <p className="text-[12px] mt-1 paragraph-color">لطفاً تعداد دوربین‌ها یا الزامات هوش مصنوعی را تغییر دهید.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NvrSelector;

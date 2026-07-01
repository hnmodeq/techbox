"use client";

import React, { useMemo, useState } from "react";
import { Icon } from "@/design/icons";
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

  return (
    <div className={["w-full max-w-[1100px] mx-auto", className].filter(Boolean).join(" ")} dir="rtl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full bg-[color-mix(in_oklch,var(--tb-raid)_12%,transparent)] text-[var(--tb-raid)] text-xs font-bold flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--tb-raid)_22%,var(--tb-border))]">
            <Icon name="server" className="w-3.5 h-3.5" />
            ماژول انتخاب ان‌وی‌آر
          </div>
        </div>
        <h2 className="tb-text-hero mb-2">انتخابگر ان‌وی‌آر</h2>
        <p className="text-[var(--tb-fg-muted)] max-w-md mx-auto tb-text-md">
          تعداد دوربین، رزولوشن و مدت زمان ضبط را مشخص کنید تا بهترین مدل را پیدا کنید
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-2">
          <div className="card p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="tools" className="w-5 h-5 text-[var(--tb-primary)]" />
              <h3 className="font-black text-[17px]">مشخصات مورد نیاز</h3>
            </div>

            {/* Cameras */}
            <div className="mb-7">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[13px] font-extrabold">تعداد دوربین‌ها</label>
                <div className="font-black text-[20px] tabular-nums text-[var(--tb-primary)]">
                  {fa.format(filters.cameras)}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                step="1"
                value={filters.cameras}
                onChange={(e) => handleFilterChange("cameras", parseInt(e.target.value))}
                className="w-full accent-[var(--tb-primary)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--tb-fg-muted)] mt-1">
                <span>۱</span>
                <span>۶۴</span>
              </div>
            </div>

            {/* Resolution */}
            <div className="mb-7">
              <label className="block text-[13px] font-extrabold mb-2.5">رزولوشن دوربین</label>
              <div className="flex flex-wrap gap-2">
                {nvrResolutions.map((res) => (
                  <button
                    key={res}
                    onClick={() => handleFilterChange("resolution", res)}
                    className={`px-4 py-1.5 text-sm rounded-[var(--tb-radius-md)] border transition-all ${
                      filters.resolution === res
                        ? "bg-[var(--tb-primary)] text-[var(--tb-on-accent)] border-[var(--tb-primary)]"
                        : "border-[var(--tb-border)] hover:bg-[var(--tb-bg-muted)]"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Days */}
            <div className="mb-7">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[13px] font-extrabold">مدت زمان ضبط (روز)</label>
                <div className="font-black text-[20px] tabular-nums text-[var(--tb-primary)]">
                  {fa.format(filters.days)}
                </div>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                step="1"
                value={filters.days}
                onChange={(e) => handleFilterChange("days", parseInt(e.target.value))}
                className="w-full accent-[var(--tb-primary)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--tb-fg-muted)] mt-1">
                <span>۷ روز</span>
                <span>۹۰ روز</span>
              </div>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between bg-[var(--tb-bg-muted)] px-4 py-3 rounded-[var(--tb-radius-md)]">
              <div>
                <div className="font-extrabold text-[13px]">تحلیل هوش مصنوعی</div>
                <div className="text-[12px] text-[var(--tb-fg-muted)]">تشخیص چهره، پلاک و اشیا</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.aiEnabled}
                  onChange={(e) => handleFilterChange("aiEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--tb-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--tb-primary)]"></div>
              </label>
            </div>

            {/* Storage Estimate */}
            <div className="mt-6 pt-6 border-t border-[var(--tb-border)]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--tb-fg-muted)]">حجم ذخیره‌سازی تخمینی</span>
                <span className="font-black tabular-nums text-[18px]">
                  {fa.format(storageTB)} <span className="text-[11px] font-semibold">ترابایت</span>
                </span>
              </div>
              <p className="mt-3 text-[11px] leading-6 text-[var(--tb-fg-muted)]">
                محاسبه با بیت‌ریت استاندارد H.265 – برای سناریوی دقیق با مشاوره نهایی کنید.
              </p>
            </div>

            <a href={consultationHref} className="btn btn-ghost w-full mt-5">مشاوره تخصصی NVR</a>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <span className="font-black">مدل‌های پیشنهادی</span>
              <span className="text-[12px] text-[var(--tb-fg-muted)] mr-2">({fa.format(filteredModels.length)} مدل)</span>
            </div>
            {recommendedModel && (
              <div className="text-[11px] px-3 py-1 rounded-full bg-[color-mix(in_oklch,var(--tb-success)_14%,transparent)] text-[var(--tb-success)] border border-[color-mix(in_oklch,var(--tb-success)_24%,transparent)] flex items-center gap-1 font-bold">
                <Icon name="check" className="w-3 h-3" /> بهترین انتخاب
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const isRecommended = model.id === recommendedModel?.id;
                const isSelected = selectedModel === model.id;

                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`card p-5 cursor-pointer transition-all hover:shadow-[var(--tb-shadow-md)] flex flex-col md:flex-row gap-5 items-start md:items-center ${
                      isSelected ? "ring-2 ring-[var(--tb-primary)]" : ""
                    } ${isRecommended ? "border-[color-mix(in_oklch,var(--tb-raid)_42%,var(--tb-border))]" : ""}`}
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div>
                          <div className="font-black text-[17px]">{model.nameFa}</div>
                          <div className="text-[11px] text-[var(--tb-fg-muted)]">{model.name}</div>
                        </div>
                        {isRecommended && (
                          <div className="badge !bg-[color-mix(in_oklch,var(--tb-success)_12%,transparent)] !text-[var(--tb-success)] !border-[color-mix(in_oklch,var(--tb-success)_22%,transparent)]">پیشنهادی</div>
                        )}
                        {model.aiFeatures && <span className="badge">AI</span>}
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-y-3 text-[13px]">
                        <div>
                          <div className="text-[var(--tb-fg-muted)] text-[11px]">حداکثر دوربین</div>
                          <div className="font-extrabold tabular-nums">{fa.format(model.maxCameras)} عدد</div>
                        </div>
                        <div>
                          <div className="text-[var(--tb-fg-muted)] text-[11px]">بِی ذخیره‌سازی</div>
                          <div className="font-extrabold">{fa.format(model.storageBays)} بِی</div>
                        </div>
                        <div>
                          <div className="text-[var(--tb-fg-muted)] text-[11px]">رزولوشن</div>
                          <div className="font-extrabold">{model.maxResolution}</div>
                        </div>
                        <div>
                          <div className="text-[var(--tb-fg-muted)] text-[11px]">RAID</div>
                          <div className="font-extrabold">{model.raidSupport}</div>
                        </div>
                      </div>

                      <p className="mt-3 text-[12px] text-[var(--tb-fg-muted)] leading-6">{model.descriptionFa}</p>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-start md:items-end gap-2 min-w-[170px]">
                      <div className="text-right md:text-left">
                        <div className="text-[11px] text-[var(--tb-fg-muted)]">از</div>
                        <div className="font-black text-[20px] tabular-nums tracking-tight">
                          {model.price ? fa.format(model.price) : model.priceLabel ?? "تماس بگیرید"}
                        </div>
                        <div className="text-[11px] text-[var(--tb-fg-muted)]">تومان</div>
                      </div>

                      <button
                        className="btn btn-primary text-[12px] px-5 py-2 w-full md:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect?.(model, filters);
                          if (model.href) window.location.href = model.href;
                        }}
                      >
                        انتخاب مدل
                      </button>
                      {model.href && (
                        <a
                          href={model.href}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-[var(--tb-primary)] font-bold hover:underline"
                        >
                          مشاهده در فروشگاه →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card p-8 text-center">
                <p className="text-[var(--tb-fg-muted)]">مدلی با این مشخصات پیدا نشد.</p>
                <p className="text-[12px] mt-1">لطفاً تعداد دوربین‌ها یا الزامات را کاهش دهید.</p>
              </div>
            )}
          </div>

          {filteredModels.length > 0 && (
            <div className="mt-4 px-1 text-[11px] text-[var(--tb-fg-muted)] flex items-center gap-2">
              <Icon name="shield" className="w-3.5 h-3.5" />
              قیمت‌ها تقریبی هستند و بسته به کانفیگ متفاوت می‌باشند.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NvrSelector;

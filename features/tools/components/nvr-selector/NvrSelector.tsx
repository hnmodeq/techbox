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
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full bg-[color-mix(in_oklch,var(--nvr)_12%,transparent)] text-[var(--nvr)] text-xs font-bold flex items-center gap-1.5 border border-[color-mix(in_oklch,var(--nvr)_22%,var(--border-color))]">
            <Icon name="nvr" className="w-3.5 h-3.5" />
            ماژول انتخاب ان‌وی‌آر
          </div>
        </div>
        <h2 className="text-[length:var(--h1-font-size)] text-[var(--h1-font-color)] font-extrabold mb-2">انتخابگر ان‌وی‌آر</h2>
        <p className="paragraph-color max-w-md mx-auto text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold">
          تعداد دوربین، رزولوشن و مدت زمان ضبط را مشخص کنید تا بهترین مدل‌های موجود در فروشگاه را پیدا کنید
        </p>
      </div>

      {/* Stack layout: tool options top, results below */}
      <div className="flex flex-col gap-8">
        {/* Filters Panel */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="tools" className="w-5 h-5 text-[var(--home)]" />
            <h3 className="font-black text-[17px]">مشخصات مورد نیاز پروژه</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {/* Cameras */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[13px] font-extrabold">تعداد دوربین‌ها</label>
                <div className="font-black text-[20px] tabular-nums text-[var(--home)]">
                  {fa.format(filters.cameras)} عدد
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                step="1"
                value={filters.cameras}
                onChange={(e) => handleFilterChange("cameras", parseInt(e.target.value))}
                className="w-full accent-[var(--home)]"
              />
              <div className="flex justify-between text-[10px] paragraph-color mt-1">
                <span>۱ دوربین</span>
                <span>۶۴ دوربین</span>
              </div>
            </div>

            {/* Recording Days */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-[13px] font-extrabold">مدت زمان ضبط پیوسته</label>
                <div className="font-black text-[20px] tabular-nums text-[var(--home)]">
                  {fa.format(filters.days)} روز
                </div>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                step="1"
                value={filters.days}
                onChange={(e) => handleFilterChange("days", parseInt(e.target.value))}
                className="w-full accent-[var(--home)]"
              />
              <div className="flex justify-between text-[10px] paragraph-color mt-1">
                <span>۷ روز</span>
                <span>۹۰ روز</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-7 mt-6 pt-6 border-t border-[var(--border-color)] items-center">
            {/* Resolution */}
            <div>
              <label className="block text-[13px] font-extrabold mb-2.5">رزولوشن میانگین دوربین‌ها</label>
              <div className="flex flex-wrap gap-2">
                {nvrResolutions.map((res) => (
                  <button
                    key={res}
                    onClick={() => handleFilterChange("resolution", res)}
                    className={`px-5 py-2 text-sm rounded-[var(--corner-radius)] border transition-all font-bold ${
                      filters.resolution === res
                        ? "bg-[var(--home)] text-[#ffffff] border-[var(--home)] shadow-sm"
                        : "border-[var(--border-color)] hover:bg-[var(--muted-background)]"
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between bg-[var(--muted-background)] px-5 py-4 rounded-[var(--corner-radius)] border border-[var(--border-color)]">
              <div>
                <div className="font-extrabold text-[14px]">تحلیل هوش مصنوعی و آنالیتیک</div>
                <div className="text-[12px] paragraph-color mt-0.5">تشخیص چهره، پلاک و رویدادهای هوشمند</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.aiEnabled}
                  onChange={(e) => handleFilterChange("aiEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--home)]"></div>
              </label>
            </div>
          </div>

          {/* Storage Estimate Footer inside filter card */}
          <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="paragraph-color text-[13px]">حجم ذخیره‌سازی تخمینی پروژه:</span>
              <span className="font-black tabular-nums text-[20px] text-[var(--nvr)]">
                {fa.format(storageTB)} <span className="text-[12px] font-semibold paragraph-color">ترابایت</span>
              </span>
            </div>
            <a href={consultationHref} className="btn btn-ghost">مشاوره تخصصی زیرساخت نظارت تصویری</a>
          </div>
        </div>

        {/* Results Section Positioned BELOW the tool */}
        <div className="border-t border-[var(--border-color)] pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <span className="font-black text-[18px]">مدل‌های NVR پیشنهادی فروشگاه</span>
              <span className="text-[13px] paragraph-color mr-2">({fa.format(filteredModels.length)} مدل موجود)</span>
            </div>
            {recommendedModel && (
              <div className="text-[12px] px-3 py-1 rounded-full bg-[color-mix(in_oklch,var(--tb-success)_14%,transparent)] text-[var(--tb-success)] border border-[color-mix(in_oklch,var(--tb-success)_24%,transparent)] flex items-center gap-1 font-bold">
                <Icon name="check" className="w-3.5 h-3.5" /> بهترین انتخاب برای این پروژه
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const isRecommended = model.id === recommendedModel?.id;
                const isSelected = selectedModel === model.id;
                const targetHref = model.shopSlug ? `/shop/${model.shopSlug}` : model.href || `/shop/${model.id}`;

                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`card p-5 cursor-pointer transition-all hover:shadow-[var(--shadow-size)] flex flex-col justify-between ${
                      isSelected ? "ring-2 ring-[var(--home)]" : ""
                    } ${isRecommended ? "border-[color-mix(in_oklch,var(--nvr)_45%,var(--border-color))]" : ""}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-black text-[17px] text-[var(--primary-text)]">{model.nameFa}</div>
                          <div className="text-[12px] paragraph-color mt-0.5">{model.name}</div>
                        </div>
                        {isRecommended && (
                          <div className="badge !bg-[color-mix(in_oklch,var(--tb-success)_12%,transparent)] !text-[var(--tb-success)] !border-[color-mix(in_oklch,var(--tb-success)_22%,transparent)]">پیشنهادی</div>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[12px]">
                        <div className="rounded-[var(--corner-radius)] bg-[var(--muted-background)] p-2">
                          <div className="paragraph-color text-[11px]">حداکثر دوربین</div>
                          <div className="font-extrabold tabular-nums mt-0.5">{fa.format(model.maxCameras)} کانال</div>
                        </div>
                        <div className="rounded-[var(--corner-radius)] bg-[var(--muted-background)] p-2">
                          <div className="paragraph-color text-[11px]">بِی هارد دیسک</div>
                          <div className="font-extrabold mt-0.5">{fa.format(model.storageBays)} بِی</div>
                        </div>
                        <div className="rounded-[var(--corner-radius)] bg-[var(--muted-background)] p-2">
                          <div className="paragraph-color text-[11px]">رزولوشن</div>
                          <div className="font-extrabold mt-0.5">{model.maxResolution}</div>
                        </div>
                        <div className="rounded-[var(--corner-radius)] bg-[var(--muted-background)] p-2">
                          <div className="paragraph-color text-[11px]">پشتیبانی RAID</div>
                          <div className="font-extrabold mt-0.5">{model.raidSupport}</div>
                        </div>
                      </div>

                      <p className="mt-4 text-[13px] paragraph-color leading-6">{model.descriptionFa}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[15px] font-black text-[var(--shop)]">
                        {renderPrice(model)}
                      </div>

                      <a
                        href={targetHref}
                        onClick={(e) => e.stopPropagation()}
                        className="btn btn-primary px-5 text-[13px]"
                      >
                        مشاهده در فروشگاه
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card p-8 text-center md:col-span-2">
                <p className="paragraph-color font-bold">مدلی با این مشخصات پیدا نشد.</p>
                <p className="text-[12px] mt-1 paragraph-color">لطفاً تعداد دوربین‌ها یا الزامات هوش مصنوعی را تغییر دهید.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NvrSelector;

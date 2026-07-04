'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import RaidCalculator from '@/features/tools/components/raid-calculator/RaidCalculator';

export default function HomeToolsRow() {
  return (
    <section className={`w-full py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--tb-border)] bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.toolsMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className="mx-auto max-w-7xl w-full space-y-10">
        
        {/* Header & Quick Tool Switcher Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--tb-border)]/60 pb-6">
          <div>
            <span className="badge !bg-[color-mix(in_oklch,var(--tb-tools)_15%,transparent)] !text-[var(--tb-tools)] font-black mb-2">
              ابزارهای مهندسی زیرساخت تکباکس
            </span>
            <h2 className="tb-text-big-title text-[var(--tb-fg-primary)]">محاسبه زنده ظرفیت، آرایه دیسک‌ها و پهنای باند</h2>
            <p className="mt-2 tb-text-md text-[var(--tb-fg-muted)] max-w-2xl">
              ماشین حساب RAID زیر به‌صورت زنده قابل استفاده است؛ همچنین می‌توانید از ابزارهای تخصصی انتخاب سرور، NAS و دوربین مداربسته استفاده کنید:
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/tools/nas-selector"
              className="btn btn-outline border-[var(--tb-nas)] text-[var(--tb-nas)] hover:bg-[var(--tb-nas)]/10 font-bold flex items-center gap-2"
            >
              <Icon name="nas" className="h-4 w-4" />
              <span>انتخاب‌گر هوشمند NAS</span>
            </Link>

            <Link
              href="/tools/nvr-selector"
              className="btn btn-outline border-[var(--tb-nvr)] text-[var(--tb-nvr)] hover:bg-[var(--tb-nvr)]/10 font-bold flex items-center gap-2"
            >
              <Icon name="nvr" className="h-4 w-4" />
              <span>انتخاب‌گر دستگاه NVR</span>
            </Link>

            <Link
              href="/tools/subnet-calculator"
              className="btn btn-outline border-[var(--tb-subnet)] text-[var(--tb-subnet)] hover:bg-[var(--tb-subnet)]/10 font-bold flex items-center gap-2"
            >
              <Icon name="tools" className="h-4 w-4" />
              <span>ماشین حساب Subnet</span>
            </Link>
          </div>
        </div>

        {/* Fully Interactive Embedded RAID Calculator */}
        <div className="w-full">
          <RaidCalculator />
        </div>

      </div>
    </section>
  );
}

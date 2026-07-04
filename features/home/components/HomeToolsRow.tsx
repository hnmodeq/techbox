'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import RaidCalculator from '@/features/tools/components/raid-calculator/RaidCalculator';

export default function HomeToolsRow() {
  return (
    <section className={`w-full py-14 px-4 sm:px-6 lg:px-8 bg-[var(--tb-bg-primary)] ${HOME_ROW_SIZES.toolsMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full space-y-8`}>
        
        {/* Simple Text Header with redirect buttons on left side */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">محاسبه زنده ظرفیت، آرایه دیسک‌ها و پهنای باند</h2>
            <p className="mt-1 tb-text-sm text-[var(--tb-fg-muted)]">
              ماشین حساب RAID زیر به‌صورت زنده قابل استفاده است؛ همچنین می‌توانید از ابزارهای تخصصی انتخاب سرور، NAS و دوربین مداربسته استفاده کنید:
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/tools/nas-selector"
              className="btn btn-outline !h-9 border-[var(--tb-nas)] text-[var(--tb-nas)] hover:bg-[var(--tb-nas)]/10 font-bold flex items-center gap-1.5 tb-text-sm"
            >
              <Icon name="nas" className="h-4 w-4" />
              <span>انتخاب‌گر NAS</span>
            </Link>

            <Link
              href="/tools/nvr-selector"
              className="btn btn-outline !h-9 border-[var(--tb-nvr)] text-[var(--tb-nvr)] hover:bg-[var(--tb-nvr)]/10 font-bold flex items-center gap-1.5 tb-text-sm"
            >
              <Icon name="nvr" className="h-4 w-4" />
              <span>انتخاب‌گر NVR</span>
            </Link>

            <Link
              href="/tools/subnet-calculator"
              className="btn btn-outline !h-9 border-[var(--tb-subnet)] text-[var(--tb-subnet)] hover:bg-[var(--tb-subnet)]/10 font-bold flex items-center gap-1.5 tb-text-sm"
            >
              <Icon name="tools" className="h-4 w-4" />
              <span>Subnet Calculator</span>
            </Link>
          </div>
        </div>

        {/* Fully Interactive Embedded RAID Calculator stretching wide */}
        <div className="w-full">
          <RaidCalculator />
        </div>

      </div>
    </section>
  );
}

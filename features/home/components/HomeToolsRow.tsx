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
        
        {/* Simple Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--tb-fg-primary)]">محاسبه زنده ظرفیت، آرایه دیسک‌ها و پهنای باند</h2>
          <p className="mt-1 tb-text-sm text-[var(--tb-fg-muted)]">
            ماشین حساب RAID زیر به‌صورت زنده قابل استفاده است؛ همچنین می‌توانید از ابزارهای تخصصی دیگر در پایین استفاده کنید:
          </p>
        </div>

        {/* Fully Interactive Embedded RAID Calculator */}
        <div className="w-full">
          <RaidCalculator />
        </div>

        {/* 3 Items for Other Tools Moved to BOTTOM CENTER with full width / centered buttons */}
        <div className="pt-6 border-t border-[var(--tb-border)] flex flex-col items-center justify-center gap-4">
          <h3 className="text-sm font-extrabold text-[var(--tb-fg-muted)]">
            سایر ابزارهای تخصصی مهندسی زیرساخت تکباکس:
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl">
            <Link
              href="/tools/nas-selector"
              className="group relative overflow-hidden btn btn-outline !h-11 px-6 border-[var(--tb-nas)] text-[var(--tb-nas)] hover:bg-[var(--tb-nas)]/15 font-extrabold flex items-center justify-center gap-2 tb-text-sm flex-1 sm:flex-none shadow-[0_0_15px_color-mix(in_oklch,var(--tb-nas)_25%,transparent)] hover:shadow-[0_0_25px_var(--tb-nas)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <Icon name="nas" className="h-4.5 w-4.5" />
              <span>انتخاب‌گر هوشمند NAS</span>
            </Link>

            <Link
              href="/tools/nvr-selector"
              className="group relative overflow-hidden btn btn-outline !h-11 px-6 border-[var(--tb-nvr)] text-[var(--tb-nvr)] hover:bg-[var(--tb-nvr)]/15 font-extrabold flex items-center justify-center gap-2 tb-text-sm flex-1 sm:flex-none shadow-[0_0_15px_color-mix(in_oklch,var(--tb-nvr)_25%,transparent)] hover:shadow-[0_0_25px_var(--tb-nvr)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <Icon name="nvr" className="h-4.5 w-4.5" />
              <span>انتخاب‌گر دستگاه NVR</span>
            </Link>

            <Link
              href="/tools/subnet-calculator"
              className="group relative overflow-hidden btn btn-outline !h-11 px-6 border-[var(--tb-subnet)] text-[var(--tb-subnet)] hover:bg-[var(--tb-subnet)]/15 font-extrabold flex items-center justify-center gap-2 tb-text-sm flex-1 sm:flex-none shadow-[0_0_15px_color-mix(in_oklch,var(--tb-subnet)_25%,transparent)] hover:shadow-[0_0_25px_var(--tb-subnet)] hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <Icon name="tools" className="h-4.5 w-4.5" />
              <span>ماشین حساب Subnet</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

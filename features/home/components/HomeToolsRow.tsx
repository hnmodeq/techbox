'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Icon } from '@/design/icons';
import RaidCalculator from '@/features/tools/components/raid-calculator/RaidCalculator';

export default function HomeToolsRow() {
  return (
    <section className={`w-full py-14 px-4 sm:px-6 lg:px-8 bg-[var(--main-background)] ${HOME_ROW_SIZES.toolsMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full space-y-8`}>
        
        {/* Simple Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--primary-text)]">محاسبه زنده ظرفیت، آرایه دیسک‌ها و پهنای باند</h2>
          <p className="mt-1 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
            ماشین حساب RAID زیر به‌صورت زنده قابل استفاده است؛ همچنین می‌توانید از ابزارهای تخصصی دیگر در پایین استفاده کنید:
          </p>
        </div>

        {/* Fully Interactive Embedded RAID Calculator */}
        <div className="w-full">
          <RaidCalculator />
        </div>

        {/* 3 Items for Other Tools Moved to BOTTOM CENTER with full width / centered buttons */}
        <div className="pt-6 border-t border-[var(--border-color)] flex flex-col items-center justify-center gap-4">
          <h3 className="text-sm font-extrabold paragraph-color">
            سایر ابزارهای تخصصی مهندسی زیرساخت تکباکس:
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 w-full max-w-3xl">
            <Link
              href="/tools/nas-selector"
              className="group flex items-center justify-center gap-2 text-[var(--nas)] font-black text-sm sm:text-base drop-shadow-[0_0_10px_var(--nas)] hover:drop-shadow-[0_0_20px_var(--nas)] hover:scale-105 transition-all duration-300 py-2"
            >
              <Icon name="nas" className="h-5 w-5" />
              <span>انتخاب‌گر هوشمند NAS</span>
            </Link>

            <Link
              href="/tools/nvr-selector"
              className="group flex items-center justify-center gap-2 text-[var(--nvr)] font-black text-sm sm:text-base drop-shadow-[0_0_10px_var(--nvr)] hover:drop-shadow-[0_0_20px_var(--nvr)] hover:scale-105 transition-all duration-300 py-2"
            >
              <Icon name="nvr" className="h-5 w-5" />
              <span>انتخاب‌گر دستگاه NVR</span>
            </Link>

            <Link
              href="/tools/subnet-calculator"
              className="group flex items-center justify-center gap-2 text-[var(--subnet)] font-black text-sm sm:text-base drop-shadow-[0_0_10px_var(--subnet)] hover:drop-shadow-[0_0_20px_var(--subnet)] hover:scale-105 transition-all duration-300 py-2"
            >
              <Icon name="tools" className="h-5 w-5" />
              <span>ماشین حساب Subnet</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

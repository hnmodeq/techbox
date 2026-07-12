'use client';

import React from 'react';
import { HOME_ROW_SIZES } from './HomeRowConfig';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Icon } from '@/design/icons';
import RaidCalculator from '@/features/tools/components/raid-calculator/RaidCalculator';

export default function HomeToolsRow() {
  return (
    <section className={`w-full py-14 px-4 sm:px-6 lg:px-8 bg-background ${HOME_ROW_SIZES.toolsMinHeight} flex flex-col justify-center`} dir="rtl">
      <div className={`mx-auto ${HOME_ROW_SIZES.containerMaxWidth} w-full space-y-8`}>
        
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">محاسبه زنده ظرفیت، آرایه دیسک‌ها و پهنای باند</h2>
            <Badge variant="outline" className="text-[var(--raid)] border-[var(--raid)]/30 bg-[var(--raid)]/10">تعاملی</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ماشین حساب RAID زیر به‌صورت زنده قابل استفاده است؛ همچنین می‌توانید از ابزارهای تخصصی دیگر در پایین استفاده کنید:
          </p>
        </div>

        {/* Fully Interactive Embedded RAID Calculator */}
        <div className="w-full">
          <RaidCalculator />
        </div>

        {/* Other Tools */}
        <div className="pt-6">
          <Separator className="mb-6" />
          <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-sm font-extrabold text-muted-foreground">
              سایر ابزارهای تخصصی مهندسی زیرساخت تکباکس:
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-3xl">
              <ButtonLink variant="outline" size="sm" className="gap-2 text-[var(--nas)] border-[var(--nas)]/30 hover:bg-[var(--nas)]/10" href="/tools/nas-selector">
                <Icon name="nas" className="h-4 w-4" />
                <span>انتخاب‌گر هوشمند NAS</span>
              </ButtonLink>

              <ButtonLink variant="outline" size="sm" className="gap-2 text-[var(--nvr)] border-[var(--nvr)]/30 hover:bg-[var(--nvr)]/10" href="/tools/nvr-selector">
                <Icon name="nvr" className="h-4 w-4" />
                <span>انتخاب‌گر دستگاه NVR</span>
              </ButtonLink>

              <ButtonLink variant="outline" size="sm" className="gap-2 text-[var(--subnet)] border-[var(--subnet)]/30 hover:bg-[var(--subnet)]/10" href="/tools/subnet-calculator">
                <Icon name="tools" className="h-4 w-4" />
                <span>ماشین حساب Subnet</span>
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'خط‌زمان تکنولوژی | تکباکس',
  description: 'خط‌زمان جامع رویدادهای مهم فناوری اطلاعات از گذشته تا حال',
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "شرایط همکاری | تکباکس",
  description: "شرایط و قوانین همکاری با تکباکس.",
  path: "/terms",
});
export const revalidate = 3600;

export default async function TermsPage() {
  let content = "";
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "terms.content" } });
    if (row?.value) content = row.value;
  } catch {}

  return (
    <main className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">شرایط همکاری</h1>
      </header>

      {content ? (
        <article className="prose prose-sm max-w-none leading-8 text-foreground">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">محتوای این صفحه هنوز تنظیم نشده است.</p>
        </div>
      )}
    </main>
  );
}

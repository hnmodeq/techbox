"use client";
import Image from "next/image";
import { getModuleItems, type ContentItem } from "@/lib/content";
import { useDbPosts } from "@/hooks/useDbPosts";
import ModuleHeader from "@/components/effects/ModuleHeader";
import { formatRelativeDate } from "@/lib/date-format";
import { LikeButton } from "@/components/ui/like-button";
import CommentSection from "@/features/comment/components/CommentSection";
import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

function NewsArchiveCard({ item }: { item: any }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-[var(--card-background)] text-[var(--primary-text)] border-[length:var(--border-size)] border-[var(--border-color)] rounded-[var(--corner-radius)] shadow-[var(--shadow-size)] overflow-hidden transition-all !p-0 grid sm:grid-cols-3 gap-4 items-start">
      <div className="block relative aspect-[16/9] sm:aspect-[4/3] sm:h-full overflow-hidden bg-[var(--muted-background)]">
        <Image 
          src={item.image || "/assets/blog-1.jpg"} 
          alt={item.title} 
          fill 
          sizes="(min-width:1024px) 30vw, 100vw" 
          quality={95}
          className="object-cover transition-transform duration-[300ms] hover:scale-105" 
        />
      </div>
      <div className="p-4 sm:col-span-2 flex flex-col h-full justify-between">
        <div>
          <div className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] flex flex-wrap items-center gap-2 paragraph-color">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex items-center gap-1 font-bold text-foreground">
                    {formatRelativeDate(item.date)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(item.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {item.time && <span>• {item.time}</span>}
            {item.source && <><span>•</span><span>منبع: {item.source}</span></>}
          </div>
          <h3 className="text-[length:var(--h2-font-size)] text-[var(--h2-font-color)] font-bold mt-2">{item.title}</h3>
          <p className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] mt-2 paragraph-color">{item.excerpt}</p>
        </div>
        <div className="mt-4 pt-3 border-t-[length:var(--border-size)] border-[var(--border-color)]/50 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <LikeButton contentType="news" slug={item.slug} initial={item.likes || 0} tooltipLabel="پسندیدن خبر" />
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] hover:text-primary transition-colors font-bold text-muted-foreground"
            >
              مشاهده بیشتر ({item.comments || 0})
            </button>
          </div>
          
          {showComments && (
            <div className="mt-2 border-t-[length:var(--border-size)] border-[var(--border-color)]/30 pt-4 w-full">
              <CommentSection module="news" slug={item.slug} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewsList({ serverItems }: { serverItems?: ContentItem[] }) {
 const fallbackItems = getModuleItems("news");
 const { items: dbItems } = useDbPosts("news", fallbackItems, 100);

 const items = serverItems && serverItems.length > 0 ? serverItems : dbItems;

 return (
 <main className="mx-auto max-w-4xl px-4 md:px-6 py-12" dir="rtl">
   <ModuleHeader module="news" description="بایگانی کامل اخبار" />

   <div className="flex flex-col gap-5 mt-6">
     {items.map((n: any) => (
        <NewsArchiveCard key={n.slug} item={n} />
     ))}
   </div>
   
   {/* Basic Pagination Component Placeholder (You could replace this with a real Shadcn pagination component) */}
   <div className="mt-10 flex justify-center">
     <button className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:bg-muted transition-colors">
       صفحه بعد
     </button>
   </div>
 </main>
 );
}

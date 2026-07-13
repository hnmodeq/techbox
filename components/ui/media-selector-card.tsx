"use client";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import * as React from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "./aspect-ratio";
import { CardStats } from "./card-stats";

export interface MediaSelectorCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 active?: boolean;
 slug?: string;
 image?: string;
 title: string;
 category?: string;
 author?: string;
 dateFa?: string;
 views?: number;
 likes?: number;
 comments?: number;
 duration?: string;
}

export const MediaSelectorCard = React.forwardRef<HTMLButtonElement, MediaSelectorCardProps>(
 ({
 active,
 slug,
 image,
 title,
 category,
 author,
 dateFa,
 views,
 likes,
 comments,
 duration,
 className,
 ...props
 }, ref) => (
 <button
 ref={ref}
 type="button"
 className={cn(
 "group relative block w-full overflow-hidden rounded-xl border bg-card text-right shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
 active ? "ring-2 ring-primary" : "",
 className
 )}
 {...props}
 >
 <AspectRatio ratio={9 / 16} className="bg-muted">
   <Image
   src={image || "/assets/blog-1.jpg"}
   alt={title}
   fill
   sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
   className="object-cover transition-transform duration-300 group-hover:scale-105"
   {...blurProps(image || "/assets/blog-1.jpg")}
   />
   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 transition-opacity group-hover:opacity-95" />

   <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
   <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform group-hover:scale-110 shadow-sm">
   ▶
   </span>
   </span>

   {category && (
   <span className="absolute top-3 right-3 rounded-full border border-white/30 bg-black/40 px-2.5 py-0.5 text-xs text-white backdrop-blur-md">
   {category}
   </span>
   )}
   {duration && (
   <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
   {duration}
   </span>
   )}

   <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 flex flex-col justify-end">
   <h4 className="text-base font-bold line-clamp-2 transition-colors duration-150 group-hover:text-[var(--media)]">
   {title}
   </h4>
   <div className="mt-2 flex items-center justify-between text-xs text-white/80">
   {author && <span>{author}</span>}
   {dateFa && <span>{dateFa}</span>}
   </div>
   <div className="mt-2 border-t border-white/20 pt-2">
   {slug ? <CardStats module="media" slug={slug} showComments={true} /> : (
   <div className="flex items-center gap-3 text-xs text-white/80">
   {typeof views === "number" && <span>👁 {views.toLocaleString("fa-IR")}</span>}
   {typeof likes === "number" && <span>♥ {likes.toLocaleString("fa-IR")}</span>}
   {typeof comments === "number" && <span>💬 {comments.toLocaleString("fa-IR")}</span>}
   </div>
   )}
   </div>
   </div>
 </AspectRatio>
 </button>
 )
);
MediaSelectorCard.displayName = "MediaSelectorCard";

export default MediaSelectorCard;

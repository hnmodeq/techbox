"use client";
import Image from "next/image";
import { blurProps } from "@/lib/image-placeholder";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
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
 "group relative block w-full aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-[var(--border-color)] text-right transition-all duration-[200ms] hover:-translate-y-1 hover:shadow-[var(--shadow-size)]",
 active ? "ring-2 ring-[var(--media)]" : "",
 className
 )}
 {...props}
 >
 <Image
 src={image || "/assets/blog-1.jpg"}
 alt={title}
 fill
 sizes="(min-width:1024px) 33vw, 100vw"
 className="object-cover transition-transform duration-[300ms] group-hover:scale-105"
 {...blurProps(image || "/assets/blog-1.jpg")}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 transition-opacity group-hover:opacity-95" />

 <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition-transform group-hover:scale-110 shadow-[var(--shadow-size)]">
 ▶
 </span>
 </span>

 {category && (
 <span className="absolute top-3 right-3 rounded-full border-[length:var(--border-size)] border-white/30 bg-black/40 px-2.5 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white backdrop-blur-md">
 {category}
 </span>
 )}
 {duration && (
 <span className="absolute top-3 left-3 rounded-[var(--corner-radius)] bg-black/60 px-2 py-0.5 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white backdrop-blur-sm">
 {duration}
 </span>
 )}

 <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 flex flex-col justify-end">
 <h4 className="text-[length:var(--h3-font-size)] text-[var(--h3-font-color)] font-semibold font-bold line-clamp-2 transition-colors duration-[150ms] group-hover:text-[var(--media)]">
 {title}
 </h4>
 <div className="mt-2 flex items-center justify-between text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white/80">
 {author && <span>{author}</span>}
 {dateFa && <span>{dateFa}</span>}
 </div>
 <div className="mt-2 pt-2 border-t-[length:var(--border-size)] border-white/20">
 {slug ? <CardStats module="media" slug={slug} showComments={true} /> : (
 <div className="flex items-center gap-3 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] text-white/80">
 {typeof views === "number" && <span>👁 {views.toLocaleString("fa-IR")}</span>}
 {typeof likes === "number" && <span>♥ {likes.toLocaleString("fa-IR")}</span>}
 {typeof comments === "number" && <span>💬 {comments.toLocaleString("fa-IR")}</span>}
 </div>
 )}
 </div>
 </div>
 </button>
 )
);
MediaSelectorCard.displayName = "MediaSelectorCard";

export default MediaSelectorCard;

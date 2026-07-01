"use client";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export interface MediaSelectorCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 active?: boolean;
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
 image,
 title,
 category,
 author,
 dateFa,
 views,
 likes,
 comments,
 duration = "۱۲:۴۴",
 className,
 ...props
 }, ref) => (
 <button
 ref={ref}
 type="button"
 className={cn(
 "card group overflow-hidden text-start text-right transition-all duration-[var(--tb-motion-md)]",
 active ? "ring-2 ring-[var(--tb-media)] shadow-[var(--tb-shadow-lg)]" : "hover:-translate-y-1 hover:shadow-[var(--tb-shadow-md)]",
 className
 )}
 {...props}
 >
 <div className="relative aspect-video bg-black">
 <Image
 src={image || "/assets/blog-1.jpg"}
 alt={title}
 fill
 sizes="(min-width:1024px) 33vw, 100vw"
 className="object-cover opacity-90 transition-opacity duration-[var(--tb-motion-md)] group-hover:opacity-100"
 />
 <span className="absolute inset-0 flex items-center justify-center">
 <span className="tb-image-badge flex h-14 w-14 items-center justify-center tb-text-lg text-white">▶</span>
 </span>
 <span className="absolute bottom-2 left-2 rounded-[var(--tb-radius-sm)] bg-[color-mix(in oklch, black 60%, transparent)] px-2 py-0.5 tb-text-sm text-white">
 {duration}
 </span>
 {category && <Badge variant="media" className="absolute right-2 top-2 !tb-text-sm">{category}</Badge>}
 </div>
 <div className="p-3">
 <div className="min-h-[48px] line-clamp-2 tb-text-sm ">{title}</div>
 <div className="mt-2 flex items-center justify-between tb-text-sm text-[var(--tb-fg-muted)]">
 {author && <span>{author}</span>}
 {dateFa && <span>{dateFa}</span>}
 </div>
 <div className="mt-2 flex items-center gap-3 border-t border-[color-mix(in_oklch,var(--tb-border)_50%,transparent)] pt-2 tb-text-sm text-[var(--tb-fg-muted)]">
 {typeof views === "number" && <span>👁 {views.toLocaleString("fa-IR")}</span>}
 {typeof likes === "number" && <span>♥ {likes.toLocaleString("fa-IR")}</span>}
 {typeof comments === "number" && <span>💬 {comments.toLocaleString("fa-IR")}</span>}
 </div>
 </div>
 </button>
 )
);
MediaSelectorCard.displayName = "MediaSelectorCard";

export default MediaSelectorCard;

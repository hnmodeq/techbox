"use client";
import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({ src, poster, title }: { src: string; poster?: string; title?: string }) {
 const videoRef = useRef<HTMLVideoElement>(null);
 const [isHls, setIsHls] = useState(false);

 useEffect(() => {
 let hls: any;
 const video = videoRef.current;
 if (!video || !src) return;
 const isHlsSrc = src.includes(".m3u8");
 setIsHls(isHlsSrc);
 if (isHlsSrc) {
 (async () => {
 const Hls = (await import("hls.js")).default;
 if (Hls.isSupported()) {
 hls = new Hls({ enableWorker: true, lowLatencyMode: true });
 hls.loadSource(src);
 hls.attachMedia(video);
 } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
 video.src = src;
 }
 })();
 } else {
 video.src = src;
 }
 return () => { try { hls?.destroy(); } catch {} };
 }, [src]);

 return (
 <div className="w-full bg-black rounded-[var(--corner-radius)] overflow-hidden border border-[var(--border-color)]">
 <video ref={videoRef} controls playsInline poster={poster} preload="metadata" className="w-full aspect-video bg-black" />
 {title && (
 <div className="flex justify-between bg-[var(--card-background)] px-3 py-2 text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)] paragraph-color">
 <span className="truncate">{title}</span>
 <span className="text-[length:var(--paragraph-font-size)] text-[var(--paragraph-color)]">{isHls ? "HLS • تطبیقی" : "MP4"}</span>
 </div>
 )}
 </div>
 );
}

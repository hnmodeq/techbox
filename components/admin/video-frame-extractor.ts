const waitFor = (target: HTMLMediaElement, event: "loadedmetadata" | "seeked", timeoutMs = 12_000) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`video_${event}_timeout`));
    }, timeoutMs);
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error("video_decode_failed")); };
    const cleanup = () => {
      window.clearTimeout(timer);
      target.removeEventListener(event, done);
      target.removeEventListener("error", failed);
    };
    target.addEventListener(event, done, { once: true });
    target.addEventListener("error", failed, { once: true });
  });

function canvasWebP(canvas: HTMLCanvasElement, quality = 0.9) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("webp_encode_failed")),
      "image/webp",
      quality,
    );
  });
}

/** Decode ten evenly spaced frames in the admin's browser. This avoids an
 * ffmpeg binary in Vercel while still producing real WebP storyboard frames. */
export async function extractVideoFrames(file: File, count = 10): Promise<{ frames: File[]; duration: number }> {
  if (count < 10) throw new Error("at_least_ten_frames_required");
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  const metadataReady = waitFor(video, "loadedmetadata");
  video.src = objectUrl;

  try {
    await metadataReady;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("invalid_video_duration");

    const maxWidth = 720;
    const scale = Math.min(1, maxWidth / Math.max(1, video.videoWidth));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("canvas_unavailable");

    const frames: File[] = [];
    for (let index = 0; index < count; index += 1) {
      // Avoid codec-black first/last frames by sampling 5%–95% of duration.
      const progress = 0.05 + (index / Math.max(1, count - 1)) * 0.9;
      const seeked = waitFor(video, "seeked");
      video.currentTime = Math.min(duration - 0.01, duration * progress);
      await seeked;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await canvasWebP(canvas);
      frames.push(new File([blob], `frame-${String(index + 1).padStart(2, "0")}.webp`, { type: "image/webp" }));
    }
    return { frames, duration };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

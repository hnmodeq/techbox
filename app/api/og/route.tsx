import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/og?title=...&module=...&category=...
 * Generates a branded OG image for social sharing.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "تکباکس";
  const moduleKey = searchParams.get("module") || "";
  const category = searchParams.get("category") || "";

  const moduleColors: Record<string, string> = {
    blog: "#fb923c",
    news: "#fb7185",
    media: "#fcd34d",
    shop: "#a3e635",
    forum: "#fda4af",
    review: "#38bdf8",
    download: "#f472b6",
    tools: "#67e8f9",
    timeline: "#06b6d4",
  };

  const moduleLabels: Record<string, string> = {
    blog: "مجله",
    news: "اخبار",
    media: "رسانه",
    shop: "فروشگاه",
    forum: "انجمن",
    review: "بررسی",
    download: "دانلود",
    tools: "ابزارها",
    timeline: "تایم‌لاین",
  };

  const color = moduleColors[moduleKey] || "#8b5cf6";
  const label = moduleLabels[moduleKey] || moduleKey;

  // Truncate title to fit
  const displayTitle = title.length > 80 ? title.slice(0, 77) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          backgroundColor: "#0a0a0a",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
        dir="rtl"
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${color}15 0%, transparent 50%)`,
          }}
        />

        {/* Module badge */}
        {label && (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                backgroundColor: color,
                color: "white",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
            {category && (
              <div
                style={{
                  backgroundColor: "#ffffff15",
                  color: "#ffffff80",
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 16,
                }}
              >
                {category}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            padding: "40px 40px 60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: displayTitle.length > 50 ? 36 : 44,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.4,
              textAlign: "right",
              maxWidth: "90%",
            }}
          >
            {displayTitle}
          </div>

          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "#ffffff60",
                fontWeight: 500,
              }}
            >
              تکباکس — رسانه تخصصی فناوری
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              T
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

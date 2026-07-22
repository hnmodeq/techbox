"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmpty } from "@/components/admin/admin-states";
import { toast } from "sonner";
import { History, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

type Revision = {
  id: string;
  postId: string;
  oldTitle: string | null;
  oldContent: string | null;
  oldImage: string | null;
  editedBy: string | null;
  editedAt: string;
};

export function RevisionHistory({
  postId,
  onRestored,
}: {
  postId: string;
  onRestored?: () => void;
}) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/admin/revisions?postId=${postId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRevisions(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const restore = async (revisionId: string) => {
    if (!confirm("آیا مطمئنید؟ نسخه فعلی قبل از بازگردانی ذخیره می‌شود.")) return;
    setRestoring(revisionId);
    try {
      const res = await fetch("/api/admin/revisions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId }),
      });
      if (res.ok) {
        toast.success("نسخه قبلی بازگردانی شد");
        onRestored?.();
      } else {
        toast.error("خطا در بازگردانی");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><History className="size-4" /> تاریخچه ویرایش</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="size-4" />
          تاریخچه ویرایش
          <Badge variant="secondary" className="text-[10px]">{revisions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {revisions.length === 0 ? (
          <div className="p-4">
            <AdminEmpty title="هنوز ویرایشی ثبت نشده" description="هر بار که مطلب را ویرایش کنید، نسخه قبلی اینجا ذخیره می‌شود." />
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {revisions.map((rev) => {
              const isExpanded = expandedId === rev.id;
              return (
                <div key={rev.id} className="group">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-right hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {rev.oldTitle || "(بدون عنوان)"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(rev.editedAt).toLocaleString("fa-IR")}
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={restoring === rev.id}
                      onClick={(e) => { e.stopPropagation(); restore(rev.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                    >
                      <RotateCcw className="size-3" />
                      بازگردانی
                    </Button>
                    {isExpanded ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2 bg-muted/10">
                      {rev.oldTitle && (
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground mb-0.5">عنوان</div>
                          <div className="text-xs bg-muted/30 rounded p-2">{rev.oldTitle}</div>
                        </div>
                      )}
                      {rev.oldContent && (
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground mb-0.5">محتوا ({rev.oldContent.length.toLocaleString("fa-IR")} کاراکتر)</div>
                          <div className="text-xs bg-muted/30 rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap line-clamp-6">
                            {rev.oldContent}
                          </div>
                        </div>
                      )}
                      {rev.oldImage && (
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground mb-0.5">تصویر</div>
                          <div className="text-xs font-mono bg-muted/30 rounded p-2 truncate" dir="ltr">{rev.oldImage}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

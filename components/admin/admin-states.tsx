import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";

/** Consistent loading skeleton for admin pages */
export function AdminLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>
  );
}

/** Consistent error state for admin pages */
export function AdminError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="p-6 flex items-start gap-4">
        <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">خطا</p>
          <p className="text-xs text-muted-foreground mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0 gap-1.5">
            <RefreshCw className="size-3" />
            تلاش مجدد
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/** Consistent empty state for admin pages */
export function AdminEmpty({
  title = "موردی یافت نشد",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-10 flex flex-col items-center text-center">
        <Inbox className="size-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminLoading, AdminEmpty, AdminError } from "@/components/admin/admin-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingCart, RefreshCw, Package, Truck, CheckCircle, XCircle } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  total: number;
  createdAt: string;
  items: Array<{ title: string; quantity: number; price: number }>;
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Package }> = {
  pending: { label: "در انتظار پرداخت", variant: "outline", icon: Package },
  paid: { label: "پرداخت شده", variant: "default", icon: CheckCircle },
  processing: { label: "در حال پردازش", variant: "secondary", icon: Package },
  shipped: { label: "ارسال شده", variant: "default", icon: Truck },
  delivered: { label: "تحویل داده شده", variant: "default", icon: CheckCircle },
  cancelled: { label: "لغو شده", variant: "destructive", icon: XCircle },
  refunded: { label: "بازپرداخت شده", variant: "destructive", icon: XCircle },
};

export default function AdminOrdersPage() {
  return (
    <AdminGuard superAdminOnly>
      {() => <OrdersContent />}
    </AdminGuard>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Load orders from site settings (legacy) or new Order model
      // For now, we'll use a simple approach
      setOrders([]);
    } catch (e: any) {
      setError(e?.message || "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        toast.success("وضعیت سفارش به‌روزرسانی شد");
        load();
      } else {
        toast.error("خطا در به‌روزرسانی");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <main className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="size-5" />
            مدیریت سفارشات
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {orders.length.toLocaleString("fa-IR")} سفارش
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="size-3" />
          به‌روزرسانی
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button size="xs" variant={statusFilter === "all" ? "secondary" : "ghost"} onClick={() => setStatusFilter("all")}>همه</Button>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <Button key={key} size="xs" variant={statusFilter === key ? "secondary" : "ghost"} onClick={() => setStatusFilter(key)}>
              {val.label}
            </Button>
          ))}
        </div>
      </Card>

      {error && <AdminError message={error} onRetry={load} />}

      {loading ? (
        <AdminLoading rows={4} />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="سفارشی یافت نشد" description="سفارشات جدید اینجا نمایش داده می‌شوند." />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="size-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-bold">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{order.customerName} — {order.customerPhone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <span className="text-sm font-bold">{order.total.toLocaleString("fa-IR")} تومان</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.items.length} محصول — {new Date(order.createdAt).toLocaleString("fa-IR")}
                  </div>
                  <div className="flex gap-2">
                    <Select value={order.status} onValueChange={(v) => { if (v) updateStatus(order.id, v); }}>
                      <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verifiedType?: string | null;
  verifiedLabel?: string | null;
  isFollowedByViewer?: boolean;
}

interface FollowStatsProps {
  username: string;
  viewerId?: string;
  initialFollowersCount?: number;
  initialFollowingCount?: number;
}

export function FollowStats({
  username,
  viewerId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
}: FollowStatsProps) {
  const [stats, setStats] = useState({
    followersCount: initialFollowersCount,
    followingCount: initialFollowingCount,
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Track which listed users the viewer is following (optimistic-updatable)
  const [viewerFollowing, setViewerFollowing] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  // Reconcile counts once on mount — deduped to avoid re-render loops
  useEffect(() => {
    const qs = viewerId ? `?username=${username}&viewerId=${viewerId}` : `?username=${username}`;
    fetch(`/api/follow${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setStats((prev) => {
            if (
              prev.followersCount === d.followersCount &&
              prev.followingCount === d.followingCount
            )
              return prev;
            return { followersCount: d.followersCount, followingCount: d.followingCount };
          });
        }
      })
      .catch(() => {});
  }, [username, viewerId]);

  const openModal = useCallback(
    async (type: "followers" | "following") => {
      setModalType(type);
      setShowModal(true);
      setLoadingUsers(true);
      setUsers([]);
      setViewerFollowing(new Set());

      try {
        const endpoint = type === "followers" ? "followers" : "following";
        // Pass viewerId so the API can return isFollowedByViewer in ONE query
        const qs = viewerId ? `?username=${username}&viewerId=${viewerId}` : `?username=${username}`;
        const res = await fetch(`/api/follow/${endpoint}${qs}`);
        if (res.ok) {
          const data = await res.json();
          const list: UserRow[] = data.users || [];
          setUsers(list);
          // Seed the following set from the API response (no extra round-trips)
          const alreadyFollowing = new Set<string>(
            list.filter((u) => u.isFollowedByViewer).map((u) => u.id)
          );
          setViewerFollowing(alreadyFollowing);
        }
      } finally {
        setLoadingUsers(false);
      }
    },
    [username, viewerId]
  );

  const toggleFollow = useCallback(
    async (targetUserId: string) => {
      if (!viewerId || busyIds.has(targetUserId)) return;

      const wasFollowing = viewerFollowing.has(targetUserId);
      const next = !wasFollowing;

      // Optimistic update — user sees change immediately
      setBusyIds((prev) => new Set(prev).add(targetUserId));
      setViewerFollowing((prev) => {
        const s = new Set(prev);
        next ? s.add(targetUserId) : s.delete(targetUserId);
        return s;
      });
      toast.success(next ? "دنبال می‌کنید" : "دنبال کردن متوقف شد");

      try {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId }),
        });
        if (res.ok) {
          const data = await res.json();
          // Reconcile with server truth
          setViewerFollowing((prev) => {
            const s = new Set(prev);
            data.following ? s.add(targetUserId) : s.delete(targetUserId);
            return s;
          });
        } else {
          // Revert
          setViewerFollowing((prev) => {
            const s = new Set(prev);
            wasFollowing ? s.add(targetUserId) : s.delete(targetUserId);
            return s;
          });
          toast.error("خطا در ارتباط");
        }
      } catch {
        setViewerFollowing((prev) => {
          const s = new Set(prev);
          wasFollowing ? s.add(targetUserId) : s.delete(targetUserId);
          return s;
        });
        toast.error("خطا در ارتباط");
      } finally {
        setBusyIds((prev) => {
          const s = new Set(prev);
          s.delete(targetUserId);
          return s;
        });
      }
    },
    [viewerId, viewerFollowing, busyIds]
  );

  return (
    <>
      {/* Follow counts row */}
      <TooltipProvider>
        <div className="flex items-center gap-2 text-sm" dir="rtl">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => openModal("followers")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted group"
                />
              }
            >
              <Users size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-black text-foreground text-base tabular-nums">
                {stats.followersCount.toLocaleString("fa-IR")}
              </span>
              <span className="text-muted-foreground text-xs">دنبال‌کننده</span>
            </TooltipTrigger>
            <TooltipContent>تعداد دنبال کننده‌های این کاربر</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-8 self-stretch" />

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => openModal("following")}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted group"
                />
              }
            >
              <Users size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-black text-foreground text-base tabular-nums">
                {stats.followingCount.toLocaleString("fa-IR")}
              </span>
              <span className="text-muted-foreground text-xs">دنبال می‌کند</span>
            </TooltipTrigger>
            <TooltipContent>تعداد کاربرهایی که این کاربر دنبال می‌کند</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Modal — shared for both followers & following */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {modalType === "followers" ? "دنبال‌کنندگان" : "دنبال می‌کند"}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[420px] overflow-y-auto space-y-1 -mx-1 px-1">
            {loadingUsers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-7 w-24 rounded bg-muted animate-pulse shrink-0" />
                </div>
              ))
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {modalType === "followers"
                  ? "هنوز دنبال‌کننده‌ای وجود ندارد."
                  : "هنوز کسی را دنبال نمی‌کند."}
              </p>
            ) : (
              users.map((u) => {
                const isFollowing = viewerFollowing.has(u.id);
                const isBusy = busyIds.has(u.id);
                const isSelf = viewerId === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    {/* Clickable avatar + name → profile page */}
                    <Link
                      href={`/author/${u.username}`}
                      onClick={() => setShowModal(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border border-border">
                        {u.avatar ? (
                          <Image
                            src={u.avatar}
                            alt={u.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                            {u.name?.[0] ?? "؟"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground flex items-center gap-1">
                          <span className="truncate">{u.name}</span>
                          {u.verifiedType && (
                            <VerifiedBadge type={u.verifiedType as "content" | "org" | "user"} label={u.verifiedLabel} size={14} />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground" dir="ltr">
                          @{u.username}
                        </div>
                      </div>
                    </Link>

                    {/* Follow / unfollow — shown in BOTH modals for all users except self */}
                    {viewerId && !isSelf && (
                      <Button
                        size="sm"
                        variant={isFollowing ? "outline" : "primary"}
                        className="shrink-0 gap-1 text-xs whitespace-nowrap"
                        disabled={isBusy}
                        onClick={() => toggleFollow(u.id)}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus size={12} />
                            توقف دنبال کردن
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            دنبال کردن
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

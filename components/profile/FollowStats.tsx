"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface FollowStatsProps {
  username: string;
  viewerId?: string;
  /** Initial counts from the server so there's no loading flash */
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
  const [users, setUsers] = useState<{ id: string; name: string; username: string; avatar?: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Refresh counts from server (reconcile with live DB)
  useEffect(() => {
    const qs = viewerId ? `?username=${username}&viewerId=${viewerId}` : `?username=${username}`;
    fetch(`/api/follow${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStats({ followersCount: d.followersCount, followingCount: d.followingCount });
      })
      .catch(() => {});
  }, [username, viewerId]);

  const openModal = async (type: "followers" | "following") => {
    setModalType(type);
    setShowModal(true);
    setLoadingUsers(true);
    setUsers([]);

    try {
      const endpoint = type === "followers" ? "followers" : "following";
      const res = await fetch(`/api/follow/${endpoint}?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <>
      {/* Follow counts row */}
      <div className="flex items-center gap-4 text-sm" dir="rtl">
        <button
          onClick={() => openModal("followers")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted group"
        >
          <Users size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-black text-foreground text-base tabular-nums">
            {stats.followersCount.toLocaleString("fa-IR")}
          </span>
          <span className="text-muted-foreground text-xs">دنبال‌کننده</span>
        </button>

        <Separator orientation="vertical" className="h-5" />

        <button
          onClick={() => openModal("following")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted group"
        >
          <Users size={15} className="text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-black text-foreground text-base tabular-nums">
            {stats.followingCount.toLocaleString("fa-IR")}
          </span>
          <span className="text-muted-foreground text-xs">دنبال می‌کند</span>
        </button>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {modalType === "followers" ? "دنبال‌کنندگان" : "دنبال می‌کند"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-1 -mx-1 px-1">
            {loadingUsers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {modalType === "followers" ? "هنوز دنبال‌کننده‌ای وجود ندارد." : "هنوز کسی را دنبال نمی‌کند."}
              </p>
            ) : (
              users.map((u) => (
                <Link
                  key={u.id}
                  href={`/author/${u.username}`}
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
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
                  <div>
                    <div className="font-semibold text-sm text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground" dir="ltr">@{u.username}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

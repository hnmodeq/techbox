"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

interface FollowStatsProps {
  username: string;
  viewerId?: string;
}

export function FollowStats({ username, viewerId }: FollowStatsProps) {
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/follow?username=${username}`)
      .then(res => res.json())
      .then(setStats)
      .catch(() => {});
  }, [username]);

  const openModal = async (type: "followers" | "following") => {
    setModalType(type);
    setShowModal(true);

    const endpoint = type === "followers" ? "followers" : "following";
    const res = await fetch(`/api/follow/${endpoint}?username=${username}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  };

  return (
    <>
      <div className="flex gap-4 text-sm">
        <button onClick={() => openModal("followers")} className="hover:underline">
          <span className="font-bold">{stats.followersCount}</span> دنبال‌کننده
        </button>
        <button onClick={() => openModal("following")} className="hover:underline">
          <span className="font-bold">{stats.followingCount}</span> دنبال می‌کند
        </button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === "followers" ? "دنبال‌کنندگان" : "دنبال می‌کند"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">هیچ کاربری وجود ندارد.</p>
            ) : (
              users.map((u) => (
                <Link key={u.id} href={`/author/${u.username}`} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {u.avatar && <img src={u.avatar} alt={u.name} className="object-cover w-full h-full" />}
                  </div>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
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
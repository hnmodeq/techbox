"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  viewerId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({ targetUserId, viewerId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [busy, setBusy] = useState(false);

  const toggleFollow = async () => {
    if (busy) return;

    // Optimistic update — user sees the change immediately
    const next = !isFollowing;
    setIsFollowing(next);
    toast.success(next ? "دنبال می‌کنید" : "دنبال کردن متوقف شد");

    // Fire-and-forget in the background
    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Reconcile with server truth silently
        setIsFollowing(data.following);
      } else {
        // Revert on server error
        setIsFollowing(!next);
        toast.error("خطا در ارتباط");
      }
    } catch {
      setIsFollowing(!next);
      toast.error("خطا در ارتباط");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={toggleFollow}
      variant={isFollowing ? "outline" : "primary"}
      size="sm"
      className="gap-1.5"
    >
      {isFollowing ? (
        <>
          <UserMinus size={14} />
          توقف دنبال کردن
        </>
      ) : (
        <>
          <UserPlus size={14} />
          دنبال کردن
        </>
      )}
    </Button>
  );
}

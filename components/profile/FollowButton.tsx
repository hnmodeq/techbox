"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  viewerId: string;
}

export function FollowButton({ targetUserId, viewerId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        toast.success(data.following ? "دنبال می‌کنید" : "دنبال کردن متوقف شد");
      }
    } catch {
      toast.error("خطا در ارتباط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="mt-2"
    >
      {isFollowing ? "توقف دنبال کردن" : "دنبال کردن"}
    </Button>
  );
}
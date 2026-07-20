"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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

    const next = !isFollowing;
    setIsFollowing(next);
    toast.success(next ? "دنبال می‌کنید" : "دنبال کردن متوقف شد");

    setBusy(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
      } else {
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={toggleFollow}
              variant={isFollowing ? "outline" : "primary"}
              size="sm"
              className="gap-1.5"
            />
          }
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
        </TooltipTrigger>
        <TooltipContent dir="rtl" className="max-w-[220px] text-center">
          با دنبال کردن این کاربر از فعالیت‌های عمومی او مطلع می‌شوید
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

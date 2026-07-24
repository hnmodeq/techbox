"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsModal({ content, trigger }: { content: string; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer inline">
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>شرایط همکاری</DialogTitle>
            <DialogDescription>شرایط و قوانین همکاری با تکباکس</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-2">
            <div className="prose prose-sm max-w-none leading-7 text-foreground pr-3" dangerouslySetInnerHTML={{ __html: content }} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

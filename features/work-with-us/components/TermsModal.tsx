"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsModal({ content }: { content?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-primary underline cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit">
        شرایط همکاری
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>شرایط همکاری</DialogTitle>
            <DialogDescription>شرایط و قوانین همکاری با تکباکس</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-2">
            {content ? (
              <div className="prose prose-sm max-w-none leading-7 text-foreground pr-3" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p className="text-sm text-muted-foreground pr-3">محتوای شرایط همکاری هنوز تنظیم نشده است.</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

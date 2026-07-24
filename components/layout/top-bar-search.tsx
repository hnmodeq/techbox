"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TopBarSearch() {
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setExpanded(false);
    setValue("");
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center" dir="rtl">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="جستجو"
        >
          <SearchIcon className="size-4" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <div className="relative">
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="جستجو..."
              className="h-8 w-48 sm:w-64 text-sm pr-8"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setExpanded(false);
                  setValue("");
                }
              }}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => { setExpanded(false); setValue(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

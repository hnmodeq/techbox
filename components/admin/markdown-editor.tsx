"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Eye,
  Pencil,
} from "lucide-react";

type ToolbarAction = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prefix: string;
  suffix: string;
  placeholder?: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "بولد", prefix: "**", suffix: "**", placeholder: "متن بولد" },
  { icon: Italic, label: "ایتالیک", prefix: "*", suffix: "*", placeholder: "متن ایتالیک" },
  { icon: Heading1, label: "عنوان ۱", prefix: "## ", suffix: "", placeholder: "عنوان" },
  { icon: Heading2, label: "عنوان ۲", prefix: "### ", suffix: "", placeholder: "عنوان" },
  { icon: Heading3, label: "عنوان ۳", prefix: "#### ", suffix: "", placeholder: "عنوان" },
  { icon: LinkIcon, label: "لینک", prefix: "[", suffix: "](https://)", placeholder: "متن لینک" },
  { icon: ImageIcon, label: "تصویر", prefix: "![", suffix: "](https://)", placeholder: "alt text" },
  { icon: List, label: "لیست", prefix: "- ", suffix: "", placeholder: "آیتم" },
  { icon: ListOrdered, label: "لیست شماره‌دار", prefix: "1. ", suffix: "", placeholder: "آیتم" },
  { icon: Quote, label: "نقل قول", prefix: "> ", suffix: "", placeholder: "نقل قول" },
  { icon: Code, label: "کد", prefix: "```\n", suffix: "\n```", placeholder: "کد" },
  { icon: Minus, label: "خط جداکننده", prefix: "\n---\n", suffix: "", placeholder: "" },
];

function insertMarkdown(textarea: HTMLTextAreaElement, action: ToolbarAction): { newText: string; newCursorPos: number } {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.slice(start, end);
  const insertText = selectedText || action.placeholder || "";
  const before = text.slice(0, start);
  const after = text.slice(end);
  const newText = `${before}${action.prefix}${insertText}${action.suffix}${after}`;
  const cursorPos = start + action.prefix.length + insertText.length;
  return { newText, newCursorPos: cursorPos };
}

// Simple Markdown-to-HTML renderer for preview
function markdownToHtml(md: string): string {
  return md
    // Headings
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr />")
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;" />')
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "محتوا را اینجا بنویسید... (Markdown پشتیبانی می‌شود)",
  minHeight = "260px",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToolbar = useCallback((action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { newText, newCursorPos } = insertMarkdown(textarea, action);
    onChange(newText);
    // Restore cursor position after React re-renders
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [onChange]);

  return (
    <div className="space-y-0">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "preview")}>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Toolbar */}
          {tab === "write" && (
            <div className="flex flex-wrap gap-0.5">
              {TOOLBAR_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    title={action.label}
                    onClick={() => handleToolbar(action)}
                  >
                    <Icon className="size-3.5" />
                  </Button>
                );
              })}
            </div>
          )}
          {tab === "preview" && <div />}

          <TabsList className="h-7">
            <TabsTrigger value="write" className="text-[10px] gap-1 px-2">
              <Pencil className="size-3" /> ویرایش
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-[10px] gap-1 px-2">
              <Eye className="size-3" /> پیش‌نمایش
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="mt-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-sm"
            style={{ minHeight, direction: "ltr", textAlign: "left" }}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <Card className="p-4 overflow-y-auto" style={{ minHeight }}>
            {value.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none typeset"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">محتوایی برای پیش‌نمایش وجود ندارد.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

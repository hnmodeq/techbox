"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";

// External links open in a new tab without leaking the opener.
const components: Components = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div
      className="prose prose-invert max-w-none text-sm font-normal leading-7 paragraph-color"
      dir="rtl"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Sanitiser for admin-authored HTML that is injected with
 * `dangerouslySetInnerHTML`.
 *
 * Markdown content already goes through `rehype-sanitize` inside
 * `MarkdownContent`. Two surfaces did not: the About page description and the
 * Terms page body, both of which read raw HTML out of `SiteSetting` and hand
 * it straight to React. Those are admin-only inputs, so the blast radius is
 * small — but it turns "one compromised or careless staff account" into
 * stored XSS against every visitor, which is a bigger step than it needs to
 * be. Sanitising here removes the class entirely rather than relying on the
 * author.
 *
 * The schema is GitHub's default (the same baseline the Markdown pipeline
 * uses) widened only enough for real editorial formatting:
 *   - `className` on inline/block elements, so Tailwind/prose markup survives;
 *   - `style` is deliberately NOT allowed — it is an XSS vector via
 *     `background:url(javascript:…)` in older engines and enables
 *     clickjacking overlays.
 *
 * `rehype-sanitize` drops `<script>`, event handlers (`onclick`, `onerror`,
 * …) and `javascript:` URLs by construction, so those need no special case.
 */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "dir"],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "target",
      "rel",
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "loading",
      "width",
      "height",
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
  ],
};

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

/**
 * Strip anything executable from an admin-authored HTML fragment.
 *
 * Synchronous on purpose: both call sites are React Server Components that
 * render the result inline, and `processSync` keeps them from having to
 * become async for a sub-millisecond string transform.
 */
export function sanitizeAdminHtml(html: string): string {
  if (!html) return "";
  try {
    return String(processor.processSync(html));
  } catch {
    // A malformed fragment must degrade to "no content", never to unsanitised
    // passthrough.
    return "";
  }
}

export default sanitizeAdminHtml;

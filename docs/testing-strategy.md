# Testing strategy

## The problem this document addresses

22 of 38 unit specs assert on component **source text** — they
`fs.readFileSync` a `.tsx` file and run regexes over it, checking for Tailwind
class names, JSX element ordering, and literal strings.

That style is expensive and low-signal:

- **It fails on safe refactors.** Three cosmetic commits (`d08c80c`, `654172e`,
  `3cec8ee`) turned CI red with no behavioural regression at all.
  `DealsSection` began delegating to `ShopProductCard` — still no raw `<img>`,
  still fully optimised — but the literal string `<RemoteImage` was gone, so
  the test failed. Moving `<TopicActivity>` below the heading, a deliberate
  design change, broke an `indexOf() < indexOf()` assertion.
- **It passes on real bugs.** `<RemoteImage src={undefined}>` satisfies
  `/<RemoteImage/` perfectly. So does a component that renders it inside a
  branch that never executes.
- **It anchors the design.** Changing `line-clamp-2` to `line-clamp-4` should
  be a CSS decision, not a test edit.
- **It erodes trust.** When CI is red for reasons nobody believes, people stop
  reading CI. E2E had failed on 12 consecutive runs before anyone chased it —
  and the cause turned out to be a genuinely missing database.

## What to write instead

| Constraint | Wrong tool | Right tool |
| --- | --- | --- |
| "Never use a raw `<img>`" | regex over source | ESLint rule (`@next/next/no-img-element`) |
| "Images go through next/image" | grep for `<RemoteImage` | Playwright: assert every `img.currentSrc` contains `/_next/image` |
| "Title comes before metadata" | `indexOf()` comparison | Playwright: assert DOM/a11y order |
| "The solved badge is green" | grep for a CSS variable | assert the **text** `پاسخ برتر` is present — colour is not an accessible signal |
| "Prices are formatted correctly" | — | unit test the formatter (`format-price.test.ts` — already correct) |
| "Discount never shows without a price" | — | Playwright: business invariant |
| "Admin HTML is sanitised" | grep for the import | unit test the sanitiser **and** assert no `__xss_*` global after render |

The rule of thumb: **assert on what the user or the accessibility tree
receives, not on the characters the developer typed.**

## What is already good

These specs test behaviour and should be kept as-is:

`orders`, `permissions`, `support-access`, `subnet`, `raid`, `ups`,
`url-safety`, `db-circuit`, `db-error`, `format-price`, `notifications`,
`public-content`, `content`, `auth`, `sanitize-html`.

They exercise real functions with real inputs. When one fails, something is
actually broken.

## Migration status

`tests/e2e/homepage-behaviour.spec.ts` demonstrates the target pattern and
replaces the highest-value assertions from the source-grepping specs:

- image optimisation coverage (was: `homepage-bands-and-images`)
- `sizes` attribute presence (was: `homepage-bands-and-images`)
- forum card heading order (was: `homepage-forum-section`)
- accepted-answer signalling (was: `homepage-forum-section`)
- discount/price invariant (was: `homepage-magazine-data`, deals assertions)
- ticker content (was: `homepage-bands-and-images`)
- section labelling (generalises every per-section id assertion)
- XSS sanitisation at render time (new — no source assertion covered this)

Remaining candidates, in rough priority order:

1. `homepage-news-section` (83 regex assertions)
2. `homepage-forum-section` (81) — partially covered above
3. `homepage-magazine-data` (22)
4. `homepage-bands-and-images` (18) — partially covered above
5. `module-tooltip-color`, `sidebar-layout-persistence` (11 each)
6. `homepage-scrollrail` (7) — the render-loop test is genuinely valuable and
   already has an E2E counterpart

Do these opportunistically: when a source-grep test next fails on a refactor,
replace it rather than adjust the regex. Deleting an assertion that only
restates the implementation is a net gain even with no replacement.

## Guardrails that belong in the linter

Some constraints are better enforced at lint time, where the failure message
points at the line:

```js
// eslint.config.mjs
{
  rules: {
    // Already provided by next/core-web-vitals:
    '@next/next/no-img-element': 'error',
  },
}
```

A lint rule runs on every file automatically, including files written after
the test was authored — which a hardcoded list of six paths does not.

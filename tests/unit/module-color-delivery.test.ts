import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "../..", file), "utf8");

/**
 * Module colours are an admin-controlled site setting, but visual settings
 * must be in the first HTML response. Applying them only in a client effect
 * paints the fallback primary colour first, then visibly swaps to the saved
 * colour after hydration.
 */
describe("module colour delivery", () => {
  const layout = read("app/layout.tsx");
  const provider = read("providers/module-config.provider.tsx");
  const applier = read("components/layout/ModuleColorApplier.tsx");
  const moduleConfig = read("lib/module-config.ts");

  it("writes the saved module variables into server-rendered html", () => {
    expect(layout).toMatch(/import \{ COLORABLE_MODULE_SLUGS, resolveModuleColor \}/);
    expect(layout).toMatch(/function moduleColorStyle\(config: SiteLayoutConfig \| undefined\)/);
    expect(layout).toMatch(/style\[`--module-\$\{slug\}-color-light`\] = resolveModuleColor/);
    expect(layout).toMatch(/style\[`--module-\$\{slug\}-color-dark`\] = resolveModuleColor/);
    expect(layout).toMatch(/style=\{moduleColorStyle\(moduleConfig\)\}/);
    expect(layout).toMatch(/data-module-colors=\{colorsEnabled \? "enabled" : "disabled"\}/);
  });

  it("keeps separate light/dark admin palettes and treats legacy colors as dark", () => {
    const css = read("design/globals.css");
    const admin = read("app/admin/modules/page.tsx");
    expect(moduleConfig).toMatch(/KEY_MODULE_COLORS_DARK = "modules\.custom_colors"/);
    expect(moduleConfig).toMatch(/KEY_MODULE_COLORS_LIGHT = "modules\.custom_colors_light"/);
    expect(moduleConfig).toMatch(/moduleColorsDark/);
    expect(admin).toMatch(/حالت روشن/);
    expect(admin).toMatch(/حالت تاریک/);
    expect(css).toMatch(/html\.dark[\s\S]*--module-blog-color: var\(--module-blog-color-dark/);
  });

  it("does not immediately refetch and replace server-provided configuration", () => {
    // This saves a request on every page load and, more importantly, ensures
    // the server colour and hydrated colour are the same value.
    expect(provider).toMatch(/if \(serverConfig\) return;/);
    expect(provider).toMatch(/\}, \[serverConfig\]\);/);
  });

  it("does not remove server colour variables during Strict Mode effect cleanup", () => {
    expect(applier).toMatch(/Do not remove the variables in an effect cleanup/);
    expect(applier).not.toMatch(/return \(\) => \{/);
  });

  it("never caches a transient fallback configuration", () => {
    // A fallback returned from inside unstable_cache is a successful value
    // and can preserve incorrect default colours for its full TTL.
    expect(moduleConfig).toMatch(/const cachedModuleConfig = unstable_cache/);
    expect(moduleConfig).toMatch(/return await cachedModuleConfig\(\);/);
    expect(moduleConfig).toMatch(/return getDefaultSiteLayoutConfig\(\);/);

    const uncached = moduleConfig.slice(
      moduleConfig.indexOf("async function getModuleConfigUncached"),
      moduleConfig.indexOf("const cachedModuleConfig"),
    );
    expect(uncached).not.toMatch(/catch \{/);
  });
});

describe("local development compiler", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

  it("uses the stable webpack dev server by default while retaining Turbopack as opt-in", () => {
    expect(pkg.scripts.dev).toContain("next dev --webpack");
    expect(pkg.scripts["dev:clean"]).toContain("next dev --webpack");
    expect(pkg.scripts["dev:turbo"]).toBe("prisma generate && next dev");
  });
});

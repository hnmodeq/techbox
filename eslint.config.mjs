import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "uploads/**",
      "scripts/data.cjs",
      "scripts/tree.cjs",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // The current app intentionally hydrates several localStorage-backed UI states
      // after mount. Keep these as normal client-side synchronization patterns.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",

      // Existing Persian/English content includes literal quotes in JSX text.
      "react/no-unescaped-entities": "off",

      // The project currently uses plain <img> widely for local JSON-driven assets.
      // Migrate to next/image gradually where dimensions are known.
      "@next/next/no-img-element": "warn",
    },
  },
];

export default config;

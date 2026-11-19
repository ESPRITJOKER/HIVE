import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
  ...(Array.isArray(nextTypeScript) ? nextTypeScript : [nextTypeScript]),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;

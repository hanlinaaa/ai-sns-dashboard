import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "pnpm-lock.yaml",
    "next-env.d.ts",
    "tsconfig.tsbuildinfo",
  ]),
  {
    files: [
      "app/**/*.{ts,tsx}",
      "features/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "domain/**/*.ts",
      "services/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/*",
                "@/hooks/*",
                "@/components/*",
                "!@/components/ui",
                "!@/components/ui/*",
              ],
              message:
                "Use the fixed layers: app, features, components/ui, domain, services. Shared UI utilities live under @/components/ui.",
            },
          ],
        },
      ],
    },
  },
])

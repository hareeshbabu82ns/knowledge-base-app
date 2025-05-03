import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript",
    ],
    rules: {
      "tailwindcss/no-custom-classname": "off",
    },
    ignorePatterns: ["app/generated/*"],
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: "./tailwind.config.js",
        cssFiles: ["**/*.css"],
        classAttributes: ["className", "class"],
      },
      next: {
        rootDir: ["./"],
      },
    },
    parserOptions: {
      tsconfigRootDir: __dirname,
      project: ["./tsconfig.json"],
    },
  }),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    parser: "@typescript-eslint/parser",
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;

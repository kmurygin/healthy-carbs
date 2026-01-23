// @ts-check
import {defineConfig} from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import promise from "eslint-plugin-promise";
import rxjs from "@smarttools/eslint-plugin-rxjs";

import {fileURLToPath} from "node:url";
import {dirname} from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    ignores: [
      "eslint.config.js",
      "qodana.yaml",
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**"
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      promise,
      rxjs,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      rxjs.configs.recommended,
    ],
    processor: angular.processInlineTemplates,

    rules: {
      "@angular-eslint/prefer-standalone": "error",
      "@angular-eslint/prefer-signals": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/prefer-host-metadata-property": "error",
      "@angular-eslint/component-selector": [
        "error",
        {type: "element", prefix: "app", style: "kebab-case"},
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {type: "attribute", prefix: "app", style: "camelCase"},
      ],

      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {assertionStyle: "as", objectLiteralTypeAssertions: "never"},
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {prefer: "type-imports"},
      ],
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/no-floating-promises": ["error", {ignoreVoid: true}],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {checksVoidReturn: {attributes: false}},
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {allowNumber: true, allowBoolean: true},
      ],
      "@typescript-eslint/unbound-method": ["error", {ignoreStatic: true}],

      "default-case-last": "error",
      "eqeqeq": ["error", "smart"],
      "no-duplicate-case": "error",
      "no-fallthrough": "error",
      "no-implicit-coercion": ["error", {allow: ["!!"]}],
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-throw-literal": "error",
      "no-unsafe-negation": "error",
      "prefer-promise-reject-errors": "error",
      "promise/no-callback-in-promise": "warn",
      "promise/no-nesting": "warn",
      "promise/no-new-statics": "error",
      "promise/no-promise-in-callback": "warn",
      "promise/no-return-wrap": "error",
      "promise/valid-params": "error",
      "require-await": "error",

      "rxjs/no-async-subscribe": "error",
      "rxjs/no-nested-subscribe": "error",
      "rxjs/no-redundant-notify": "error",
    },
  },

  {
    files: ["**/*.spec.ts"],
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.spec.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },

  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-distracting-elements": "error",
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/prefer-control-flow": "error",
    },
  }
);

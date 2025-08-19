// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const promise = require("eslint-plugin-promise");

module.exports = tseslint.config(
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
    },
    extends: [
      eslint.configs.recommended,

      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,

      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,

    rules: {
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
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
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
    },
  }
);

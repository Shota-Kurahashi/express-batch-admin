module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-base",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "import",
    "sort-keys-fix",
    "typescript-sort-keys",
    "unused-imports",
  ],
  root: true,
  rules: {
    "class-methods-use-this": "off",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "import/no-unresolved": "off",
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
      },
    ],
    "import/prefer-default-export": "off",
    "no-useless-constructor": "off",
    "sort-keys-fix/sort-keys-fix": "error",
    "typescript-sort-keys/interface": "error",
    "unused-imports/no-unused-imports": "error",
  },
};

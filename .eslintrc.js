module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    indent: ["error", 2],
  },
};

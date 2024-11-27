import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  // 忽略特定文件
  {
    ignores: ['node_modules', 'eslint.config.mjs'],
  },
  // 使用推薦配置
  pluginJs.configs.recommended,
  // 添加自定義規則和環境
  {
    languageOptions: {
      globals: {
        ...globals.browser, // 添加瀏覽器全局變量支持
        ...globals.node,    // 添加 Node.js 全局變量支持
      },
    },
    rules: {
      'no-alert': 'off',    // 允許使用 alert
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 忽略以下劃線命名的未使用變量
    },
  },
]
// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
import pluginJsonc from 'eslint-plugin-jsonc'
import jsoncParser from 'jsonc-eslint-parser'
import eslintConfigPrettier from 'eslint-config-prettier/flat' // Correct import for flat config

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '.astro/**', // Astro's build cache and output
      'public/**', // Typically static assets, not linted
    ],
  },

  // Base ESLint recommended config for .js, .mjs, .cjs
  eslint.configs.recommended,

  // JavaScript Configuration with browser globals
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        alert: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
      },
    },
  },

  // TypeScript Configuration for .ts, .tsx files
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      tseslint.configs.recommended, // Core TypeScript rules
      tseslint.configs.stylistic, // Stylistic TypeScript rules
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true, // Enable type-aware linting
        tsconfigRootDir: import.meta.dirname, // Assumes tsconfig.json is in the root
      },
    },
    rules: {
      // Align with Prettier config: "semi": false, "singleQuote": true
      semi: ['error', 'never'],
      '@typescript-eslint/semi': ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
      // Add any project-specific TypeScript rule overrides here
    },
  },

  // Astro Configuration
  // This applies recommended Astro linting, including for TypeScript in <script> tags
  // It bundles the parser, plugin, and rules for .astro files.
  // The `flat/recommended` config is designed for flat config and includes TypeScript type checking.
  eslintPluginAstro.configs['flat/recommended'],
  // Customizations for Astro files can be added in a separate object:
  {
    files: ['**/*.astro'],
    rules: {
      // Align with Prettier "semi": false
      'astro/semi': ['error', 'never'], // If astro plugin has its own semi rule for astro files

      // Accessibility rules
      'astro/no-set-html-directive': 'error', // Prevents XSS and encourages proper content handling
      'astro/no-set-text-directive': 'warn', // Prefer content expressions for better accessibility
      'astro/valid-compile': 'error', // Ensures valid HTML output
      'astro/no-deprecated-astro-resolve': 'error', // Avoid deprecated features
      'astro/no-conflict-set-directives': 'error', // Prevent conflicting directives
      'astro/no-unused-define-vars-in-style': 'error', // Clean up unused style variables

      // HTML accessibility best practices
      'astro/prefer-class-list-directive': 'error', // Better class handling
      'astro/prefer-object-class-list': 'error', // More maintainable class lists
      'astro/prefer-split-class-list': 'warn', // Better readability for class lists
    },
  },

  // JSON Configuration for .json, .jsonc, .json5 files
  // Define JSONC configuration directly instead of using the plugin's config
  {
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: pluginJsonc,
    },
  },
  // Customizations for JSON files:
  {
    files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
    rules: {
      'jsonc/sort-keys': [
        'warn',
        {
          pathPattern: '^$', // Root object only
          order: { type: 'asc' },
        },
      ],
      // Rules to align with Prettier for JSON (Prettier generally handles formatting)
      // eslint-config-prettier should disable conflicting formatting rules.
      // These are here for explicit consistency if ESLint --fix is used on JSON.
      'jsonc/array-bracket-spacing': ['error', 'never'],
      'jsonc/comma-dangle': ['error', 'never'], // Standard JSON does not allow trailing commas
      'jsonc/comma-style': ['error', 'last'],
      'jsonc/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'jsonc/object-curly-newline': ['error', { multiline: true, consistent: true }],
      'jsonc/object-curly-spacing': ['error', 'always'],
      'jsonc/object-property-newline': ['error', { allowMultiplePropertiesPerLine: true }],
      // JSON standard is double quotes, Prettier enforces this for JSON.
      // 'jsonc/quotes': ['error', 'double'],
      // Indentation is handled by Prettier.
      // 'jsonc/indent': ['error', 2]
    },
  },

  // Prettier Configuration (MUST BE THE LAST ONE IN THE ARRAY)
  // This turns off all ESLint rules that are unnecessary or might conflict with Prettier.
  eslintConfigPrettier
)

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Enable JSX since we are using React
    },
  },
  plugins: ['@typescript-eslint', 'perfectionist', 'unused-imports', 'prettier'],
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'prettier', // Disables rules that conflict with Prettier
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      alias: {
        map: [['src', './src']],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // Add TypeScript extensions here
      },
      typescript: {}, // This will make eslint-plugin-import recognize TypeScript files
    },
  },
  rules: {
    'no-use-before-define': 0,
    'no-alert': 0,
    camelcase: 0,
    'no-console': 0,
    'no-unused-vars': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-restricted-exports': 0,
    'no-promise-executor-return': 0,
    'import/prefer-default-export': 0,
    'prefer-destructuring': [1, { object: true, array: false }],
    // react
    'react/prop-types': 0,
    'react/no-children-prop': 0,
    'react/react-in-jsx-scope': 0,
    'react/no-array-index-key': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'react/function-component-definition': 0,
    'react/jsx-no-duplicate-props': [1, { ignoreCase: false }],
    'react/jsx-no-useless-fragment': [1, { allowExpressions: true }],
    'react/no-unstable-nested-components': [1, { allowAsProps: true }],
    // jsx-a11y
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/control-has-associated-label': 0,
    // unused imports
    'unused-imports/no-unused-imports': 1,
    'unused-imports/no-unused-vars': [
      0,
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    // perfectionist
    'perfectionist/sort-exports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-named-imports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-named-exports': [1, { order: 'asc', type: 'line-length' }],
    'perfectionist/sort-imports': [
      1,
      {
        order: 'asc',
        type: 'line-length',
        'newlines-between': 'always',
        groups: [
          'style',
          'type',
          ['builtin', 'external'],
          'custom-mui',
          'custom-routes',
          'custom-hooks',
          'custom-utils',
          'internal',
          'custom-components',
          'custom-sections',
          'custom-auth',
          'custom-types',
          ['parent', 'sibling', 'index'],
          ['parent-type', 'sibling-type', 'index-type'],
          'object',
          'unknown',
        ],
        'custom-groups': {
          value: {
            ['custom-mui']: '@mui/**',
            ['custom-auth']: 'src/auth/**',
            ['custom-hooks']: 'src/hooks/**',
            ['custom-utils']: 'src/utils/**',
            ['custom-types']: 'src/types/**',
            ['custom-routes']: 'src/routes/**',
            ['custom-sections']: 'src/sections/**',
            ['custom-components']: 'src/components/**',
          },
        },
        'internal-pattern': ['src/**'],
      },
    ],
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': [
      2, // Enforces no unused variables rule for TypeScript
      { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
    ],
    '@typescript-eslint/no-use-before-define': 0, // Disable rule for TypeScript since it's also set globally
  },
};

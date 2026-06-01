import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:auth',
                'scope:users',
                'scope:academic',
                'scope:analytics',
                'scope:staff',
                'scope:student',
              ],
            },
            {
              sourceTag: 'scope:auth',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared', 'scope:staff', 'scope:users'],
            },
            {
              sourceTag: 'scope:users',
              onlyDependOnLibsWithTags: ['scope:users', 'scope:shared'],
            },
            {
              sourceTag: 'scope:academic',
              onlyDependOnLibsWithTags: ['scope:academic', 'scope:shared'],
            },
            {
              sourceTag: 'scope:analytics',
              onlyDependOnLibsWithTags: ['scope:analytics', 'scope:shared'],
            },
            {
              sourceTag: 'scope:gateway',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:auth',
                'scope:users',
                 'scope:academic',
                'scope:analytics',
                'scope:staff',
                'scope:student',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:legacy',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:auth', 'scope:users', 'scope:academic', 'scope:analytics', 'scope:staff', 'scope:student'],
            },
            {
              sourceTag: 'scope:staff',
              onlyDependOnLibsWithTags: ['scope:staff', 'scope:shared', 'scope:academic'],
            },
            {
              sourceTag: 'scope:student',
              onlyDependOnLibsWithTags: ['scope:student', 'scope:shared', 'scope:academic'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];

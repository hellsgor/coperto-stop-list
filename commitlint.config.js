/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)\[([^\]]+)\]: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'chore',
        'docs',
        'style',
        'test',
        'perf',
        'ci',
        'build',
      ],
    ],
    'scope-enum': [2, 'always', ['stop-list']],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};

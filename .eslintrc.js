module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'warn',
    'no-trailing-spaces': 'warn',
    'eqeqeq': 'warn',
    'no-multiple-empty-lines': 'warn',
    'indent': 'warn',
    'padded-blocks': 'warn',
    'spaced-comment': 'warn',
    'keyword-spacing': 'warn',
    'quote-props': ['warn', 'consistent-as-needed'],
    'camelcase': 'off',
    'no-useless-escape': 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    'import/no-duplicates': 'warn'

  }
}

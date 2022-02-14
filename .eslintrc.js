module.exports = {
  root: false,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "no-mixed-spaces-and-tabs": 0,
    'no-unused-vars':0,
    'no-console': 0,
    'no-useless-escape': 0,
    'no-inner-declarations': "off"
  }
}

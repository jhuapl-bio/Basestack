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
    "no-console": process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    "no-mixed-spaces-and-tabs": 0,
    'no-unused-vars':0,
    'no-prototype-builtins': 0,
    'no-useless-escape': 0,
    'no-inner-declarations': "off",
    'no-magic-numbers':0,
    "vue/no-v-for-template-key": "off",
    "vue/no-v-for-template-key-on-child": "off",
    "vue/valid-v-for": "off"
  }
}

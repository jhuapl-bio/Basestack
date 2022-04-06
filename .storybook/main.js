const path = require('path')
module.exports = {
  "stories": ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": [
    "@storybook/addon-links", 
    "@storybook/addon-essentials",
    {
        name: "@storybook/addon-postcss",
        options: {
            postcssLoaderOptions: {
                implementation: require("postcss")
            }
        }
    }
  ],
  "framework": "@storybook/vue",
  core: {
    builder: "webpack5"
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, '../src/app/renderer'),
    };
    config.resolve.extensions.push(".vue");
    return config;
  },
};
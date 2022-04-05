module.exports = {
  content: [
    "./src/app/renderer/**/*.{html,js,ejs,vue}",
    "./src/**/*.stories.mdx",
    "./src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "hsl(0, 0%, 100%)",
      black: "hsl(208, 21%, 14%)",
      gray: {
        100: "hsl(200, 50%, 98%)",
        200: "hsl(210, 33%, 96%)",
        300: "hsl(216, 16%, 94%)",
        400: "hsl(210, 19%, 90%)",
        500: "hsl(215, 24%, 82%)",
        600: "hsl(209, 15%, 59%)",
        700: "hsl(212, 25%, 25%)",
        800: "hsl(208, 21%, 14%)",
        // 'lightest': 'hsl(200, 50%, 98%)',
        // 'lighter': 'hsl(210, 33%, 96%)',
        // 'light': 'hsl(216, 16%, 94%)',
        // DEFAULT: 'hsl(210, 19%, 90%)',
        // 'dark': 'hsl(215, 24%, 82%)',
        // 'darker': 'hsl(209, 15%, 59%)',
        // 'darkest': 'hsl(212, 25%, 25%)',
        // 'ultra': 'hsl(208, 21%, 14%)'
      },
      blue: {
        100: "hsl(209, 100%, 95%)",
        200: "hsl(206, 84%, 88%)",
        300: "hsl(207, 82%, 80%)",
        400: "hsl(206, 80%, 72%)",
        500: "hsl(206, 80%, 65%)",
        600: "hsl(206, 79%, 57%)",
        700: "hsl(207, 69%, 50%)",
        800: "hsl(208, 82%, 43%)",
        900: "hsl(209, 100%, 36%)",
        1000: "hsl(209, 87%, 30%)",
        // 'extralight': 'hsl(209, 100%, 95%)',
        // 'lightest': 'hsl(206, 84%, 88%)',
        // 'lighter': 'hsl(207, 82%, 80%)',
        // 'light': 'hsl(206, 80%, 72%)',
        // DEFAULT: 'hsl(206, 80%, 65%)',
        // 'dark': 'hsl(206, 79%, 57%)',
        // 'darker': 'hsl(207, 69%, 50%)',
        // 'darkest': 'hsl(208, 82%, 43%)',
        // 'extradark': 'hsl(209, 100%, 36%)',
        // 'ultradark': 'hsl(209, 87%, 30%)'
      },
      green: {
        100: "hsl(138, 67%, 45%)", // green
        200: "hsl(154, 52%, 37%)", // darkgreen
      },
      mint: "hsl(175, 43%, 49%)",
      orange: "hsl(34, 71%, 49%)",
      pink: "hsl(304, 51%, 60%)",
      red: "hsl(350, 73%, 54%)",
    },
    fontFamily: {
      display: ['"DM Sans"', "Helvetica", "Arial", "sans-serif"],
      body: ['"Source Sans Pro"', "Tahoma", "sans-serif"],
      mono: ['"DM Mono"', "Monaco"],
    },
    fontSize: {
      // @todo: ask caleb about default line-heights associated to the font size
      "2xs": "0.625rem", //10px
      xs: "0.75rem", //12px
      sm: "0.875rem", //14px
      base: "1rem", //16px
      lg: "1.25rem", //20px
      xl: "2rem", //32px
      "2xl": "2.375rem", //38px
      "3xl": "3.625rem", //38px
    },
    shadow: ({ theme }) => ({
      DEFAULT: `0 0 5px 0 ${theme.colors.gray["300"]}`,
      lg: `0 0 12px 0 ${theme.colors.gray["400"]}`,
      xl: `0 0 38px 0 ${theme.colors.gray["500"]}`,
    }),
    extend: {
      lineHeight: {
        zero: "0",
      },
    },
    strokeWidth: {
      "7": "7px",
    },
  },
  plugins: [],
};

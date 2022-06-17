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
      },
      green: {
        100: "hsl(148, 85%, 91%)",
        DEFAULT: "hsl(138, 67%, 45%)",
        900: "hsl(165, 61%, 24%)",
      },
      mint: {
          100: "hsl(174, 75%, 89%)",
          DEFAULT: "hsl(175, 43%, 49%)",
          900: "hsl(188, 60%, 23%)",
      },
      orange: {
          100: "hsl(34, 85%, 89%)",
          DEFAULT: "hsl(34, 71%, 49%)",
          900: "hsl(20, 61%, 26%)",
      },
      pink: {
        100: "hsl(296, 78%, 93%)",
        DEFAULT: "hsl(304, 51%, 60%)",
        900: "hsl(277, 63%, 24%)"
      },
      red: {
          100: "hsl(345, 80%, 91%)",
          DEFAULT: "hsl(350, 73%, 54%)",
          900: "hsl(340, 61%, 27%)"
      },
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
      borderWidth: {
        '3': '3px'
      },
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

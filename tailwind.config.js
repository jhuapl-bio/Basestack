module.exports = {
  content: ["./src/app/renderer/**/*.{html,js,ejs,vue}"],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: 'hsl(0, 0%, 100%, 1)',
      black: 'hsl(208, 21%, 14%, 1)',
      gray: {
        // check w/ caleb... all of these grays are very light
        'lightest': 'hsl(200, 50%, 98%, 100)',
        'lighter': 'hsl(210, 33%, 96%, 100)',
        'light': 'hsl(216, 16%, 94%, 100)',
        DEFAULT: 'hsl(210, 19%, 90%, 100)',
        'dark': 'hsl(215, 24%, 82%, 100)',
        'darker': 'hsl(209, 15%, 59%, 100)',
        'darkest': 'hsl(212, 25%, 25%, 100)',
      },
      primary: {
          blue: {
            // @todo: we should add jhu blues to this as well
            'light': 'hsl(209, 100%, 95%, 100)', // <-- check w/ caleb... this is so gray...
            DEFAULT: 'hsl(209, 100%, 36%, 100)',
            'dark': 'hsl(209, 87%, 30%, 100)',
            'rich': 'hsl(206, 79%, 57%, 100)'
          },
      },
      secondary: {
        green: 'hsl(138, 67%, 45%, 100)',
        mint: 'hsl(175, 43%, 49%, 100)',
        orange: 'hsl(34, 71%, 49%, 100)',
        pink: 'hsl(304, 51%, 60%, 100)',
        red: 'hsl(350, 73%, 54%, 100)',
      }
    },
    fontFamily: {
      'display': ['"DM Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      'body': ['"Source Sans Pro"', 'Tahoma', 'sans-serif'],
      'mono': ['"DM Mono"', 'Monaco'],
    },
    fontSize: {
      // @todo: ask caleb about default line-heights associated to the font size
      '2xs': '0.625rem', //10px
      'xs': '0.75rem', //12px
      'sm': '0.875rem', //14px
      'base': '1rem', //16px
      'lg': '1.25rem', //20px
      'xl': '2rem', //32px
      '2xl': '2.375rem', //38px
      '3xl': '3.625rem', //38px
    },
    shadow: ({theme}) => ({
      DEFAULT: `0 0 5px 0 ${theme.colors.gray.light}`,
      'lg': `0 0 12px 0 ${theme.colors.gray.DEFAULT}`,
      'xl': `0 0 38px 0 ${theme.colors.gray.dark}`,
    }),
    extend: {},
  },
  plugins: [],
}
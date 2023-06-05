const moo = require('moo')

const lexer = moo.compile({
            ws:     /[ \t]+/, 
            func: /\.\w+\([^\s]*?\)/,
            number: /[0-9]+/,
            // number: { match: /[0-9]+/, value: (str) => Number(str) },
            word: { match: /[a-z]+/, type: moo.keywords({ times: "x" }) },
            times:  /\*/,
            plus: "+",
            minus: "-",
            divide: "÷", 
            comment: /\/\/.*?$/,
            variable: /\$\{+.*?\}+/,
            parameter: /\%\{+.*?\}+/,
            lparen:  '(',
            rparen:  ')',
            keyword: ['while', 'if', 'else', 'moo', 'cows'],
            NL:      { match: /\n/, lineBreaks: true },
            string:  /[\d\w\.\'\"]+/,
            builtin_function: ["sqr", "sqrt", "sin", "cos", "abs", "pow"]
        })
module.exports = { lexer }
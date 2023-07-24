const moo = require("moo");

const lexer = moo.compile({
    ws: /[ \t]+/,
    nl: { match: "\n", lineBreaks: true },
    lte: "<=",
    if: 'if',
    else: 'else',
    return: 'return',
    equals: '==',
    true: 'true',
    false: 'false',
    lt: "<",
    gte: ">=",
    gt: ">",
    eq: "==",
    comma: ",",
    lbracket: "[",
    rbracket: "]",
    assign: "=",
    plus: "+",
    minus: "-",
    multiply: "*",
    comment: /\#.*?$/,
    divide: "/",
    modulo: "%",
    colon: ":",
    comment: /\/\/.*?$/,
    number:  /0|[1-9][0-9]*/,
    literal: /[a-zA-Z0-9_]+/,
    identifier: /"(?:\\["\\]|[^\n"\\])*"\s*:/,
    functionCall: /\"\%(?:\\["\\]|[^\n"\\])*/,
    string:  /"(?:\\["\\]|[^\n"\\])*"/,
    word:      { match: /[a-z]+/, type: moo.keywords(
        { 
            sin: "sin", 
            log: "log", 
            sqrt: "sqrt", 
            trim: 'trim',
            uppercase: "uppercase",
            lowercase: 'lowercase',
            lastletter: "lastletter",
            firstletter: "firstletter",
            join: "join" 

        }) 
    },
    lparan:  '(',
    rparan:  ')',
    lparen:  '(',
    rparen:  ')',
    lbrace:  '{',
    rbrace:  '}',
    fatarrow: "=>",
});
// lexer.reset('apple a9913')
// lexer.reset('apple = "steve"')

// while (true){
//     const token = lexer.next()
//     if (!token){
//         break;
//     } else {
//         console.log(token)
//     }
// }


module.exports = lexer;
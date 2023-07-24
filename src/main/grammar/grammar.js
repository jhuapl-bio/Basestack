// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const moo = require("moo");
    const path = require("path")
    const lexer = moo.compile({
    ws: /[ \t]+/,
    nl: { match: "\n", lineBreaks: true },
    number: {
        match: /[0-9]+(?:\.[0-9]+)?/,
        value: s => Number(s)
    },    
    lparen: /\(/,
    rparen: /\)/,
    comma: /,/,
    string: /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"/,
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
    times:  /\*/,
    plus:   /\+/,
    minus:  /\-/,
    divide: /\//,
    power:  /\^/,
});



function value(data){
    return data[0].value
}

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "expr", "symbols": ["optStringFuncList"], "postprocess": id},
    {"name": "expr", "symbols": ["MathExpressions"], "postprocess": id},
    {"name": "optStringFuncList", "symbols": [(lexer.has("string") ? {type: "string"} : string), "stringFuncList"], "postprocess": ([str, funcList]) => {   return str.value.slice(1, -1) + funcList.join('')}},
    {"name": "optStringFuncList", "symbols": ["stringFuncList"], "postprocess": ([str]) => { return Array.isArray(str) ? str.join("") : str.value }},
    {"name": "optStringFuncList", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": ([str]) => str.value.slice(1, -1)},
    {"name": "stringFuncList", "symbols": ["functionCall", "stringFuncList"], "postprocess": ([func, rest]) => {  return [func].concat(rest) }},
    {"name": "stringFuncList", "symbols": ["functionCall"], "postprocess": ([func]) => { return [func] }},
    {"name": "stringList", "symbols": ["_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "stringList"], "postprocess": ([, str, , , , rest]) => [str.value.slice(1, -1)].concat(rest)},
    {"name": "stringList", "symbols": ["_", (lexer.has("string") ? {type: "string"} : string), "_"], "postprocess": ([, str ,]) => str.value.slice(1, -1)},
    {"name": "functionCall", "symbols": ["_", {"literal":"uppercase"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_"], "postprocess": ([, , , , , x]) => x.value.slice(1, -1).toUpperCase()},
    {"name": "functionCall", "symbols": ["_", {"literal":"lowercase"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_"], "postprocess": ([, , , , , x]) => x.value.slice(1, -1).toLowerCase()},
    {"name": "functionCall", "symbols": ["_", {"literal":"lastletter"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_"], "postprocess": ([, , , , , x]) => x.value.slice(1, -1).slice(-1)},
    {"name": "functionCall", "symbols": ["_", {"literal":"firstletter"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_"], "postprocess": ([, , , , , x]) => x.value.slice(1, -1).slice(0, 1)},
    {"name": "functionCall", "symbols": ["_", {"literal":"sqrt"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": ([, , , , , x]) => {return Math.sqrt(Number(x.value))}},
    {"name": "functionCall", "symbols": ["_", {"literal":"log"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": ([, , , , , x]) => Math.log(Number(x.value))},
    {"name": "functionCall", "symbols": ["_", {"literal":"tan"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": ([, , , , , x]) => Math.tan(Number(x.value))},
    {"name": "functionCall", "symbols": ["_", {"literal":"join"}, "_", (lexer.has("lparen") ? {type: "lparen"} : lparen), "_", (lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comma") ? {type: "comma"} : comma), "_", "stringList", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen), "_"], "postprocess": ([, , , , , delimiter, , , , stringList]) => stringList.join(delimiter.value.slice(1, -1))},
    {"name": "MathExpressions", "symbols": ["MathExpressions", "_", "MathExpression"]},
    {"name": "MathExpressions", "symbols": ["MathExpression"], "postprocess": id},
    {"name": "MathExpression", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": ([value]) => { return Number(value.value) }},
    {"name": "MathExpression", "symbols": ["_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("times") ? {type: "times"} : times), "_", (lexer.has("number") ? {type: "number"} : number), "_"], "postprocess": ([, first, , , , second]) => Number(first.value) * Number(second.value)},
    {"name": "MathExpression", "symbols": ["_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("divide") ? {type: "divide"} : divide), "_", (lexer.has("number") ? {type: "number"} : number), "_"], "postprocess": ([, first, , , , second]) =>  Number(first.value) / Number(second.value)},
    {"name": "MathExpression", "symbols": ["_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("plus") ? {type: "plus"} : plus), "_", (lexer.has("number") ? {type: "number"} : number), "_"], "postprocess": ([, first, , , , second]) => { return  Number(first.value) + Number(second.value)}},
    {"name": "MathExpression", "symbols": ["_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("minus") ? {type: "minus"} : minus), "_", (lexer.has("number") ? {type: "number"} : number), "_"], "postprocess": ([, first, , , , second]) =>  { return Number(first.value) - Number(second.value) }},
    {"name": "MathExpression", "symbols": ["_", (lexer.has("number") ? {type: "number"} : number), "_", (lexer.has("power") ? {type: "power"} : power), "_", (lexer.has("number") ? {type: "number"} : number), "_"], "postprocess": ([, first, , , , second]) => Math.pow( Number(first.value), Number(second.value))},
    {"name": "__$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "_ml$ebnf$1", "symbols": []},
    {"name": "_ml$ebnf$1", "symbols": ["_ml$ebnf$1", "multi_line_ws_char"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_ml", "symbols": ["_ml$ebnf$1"]},
    {"name": "multi_line_ws_char", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "multi_line_ws_char", "symbols": [{"literal":"\n"}]}
]
  , ParserStart: "expr"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

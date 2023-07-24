
@{%
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
%}

# Help fucntions
@{%

function value(data){
    return data[0].value
}

%}

# Pass your lexer object using the @lexer option:
@lexer lexer

# Expression can be any of these:
expr ->
      optStringFuncList {% id %}
    | MathExpressions  {% id %}


# Optional String followed by function list:
optStringFuncList -> 
    %string stringFuncList {% ([str, funcList]) => {   return str.value.slice(1, -1) + funcList.join('')} %}
    | stringFuncList {% ([str]) => { return Array.isArray(str) ? str.join("") : str.value } %}
    | %string {% ([str]) => str.value.slice(1, -1) %}

# Function List:
stringFuncList -> functionCall stringFuncList {% ([func, rest]) => {  return [func].concat(rest) } %}
    | functionCall {% ([func]) => { return [func] } %}

# String List:
stringList ->  _  %string _ %comma _  stringList {% ([, str, , , , rest]) => [str.value.slice(1, -1)].concat(rest) %}
    | _  %string _  {% ([, str ,]) => str.value.slice(1, -1) %}
    
# Function Call:
functionCall ->
      _ "uppercase" _ %lparen _ %string _ %rparen _ {% ([, , , , , x]) => x.value.slice(1, -1).toUpperCase() %}
    | _ "lowercase" _ %lparen _ %string _ %rparen _ {% ([, , , , , x]) => x.value.slice(1, -1).toLowerCase() %}
    | _ "lastletter" _ %lparen _ %string _ %rparen _ {% ([, , , , , x]) => x.value.slice(1, -1).slice(-1) %}
    | _ "firstletter" _ %lparen _ %string _ %rparen _ {% ([, , , , , x]) => x.value.slice(1, -1).slice(0, 1) %}
    | _ "sqrt" _ %lparen _ %number _ %rparen {% ([, , , , , x]) => {return Math.sqrt(Number(x.value))} %}
    | _ "log" _ %lparen _ %number _ %rparen {% ([, , , , , x]) => Math.log(Number(x.value)) %}
    | _ "tan" _ %lparen _ %number _ %rparen {% ([, , , , , x]) => Math.tan(Number(x.value)) %}
    | _ "join" _ %lparen _ %string _ %comma _ stringList _ %rparen _ {% ([, , , , , delimiter, , , , stringList]) => stringList.join(delimiter.value.slice(1, -1)) %}
    
MathExpressions -> MathExpressions _ MathExpression  |  MathExpression  {%  id  %}

MathExpression ->  
    %number {% ([value]) => { return Number(value.value) } %}
    | _ %number _ %times _ %number _ {% ([, first, , , , second]) => Number(first.value) * Number(second.value) %}
    | _ %number _ %divide _ %number _ {% ([, first, , , , second]) =>  Number(first.value) / Number(second.value) %}
    | _ %number _ %plus _ %number _ {% ([, first, , , , second]) => { return  Number(first.value) + Number(second.value)} %}
    | _ %number _ %minus _ %number _ {% ([, first, , , , second]) =>  { return Number(first.value) - Number(second.value) } %}
    | _ %number _ %power _ %number _ {% ([, first, , , , second]) => Math.pow( Number(first.value), Number(second.value)) %}

# # Conditional statements

__ -> %ws:+

_ -> %ws:*

_ml -> multi_line_ws_char:*

multi_line_ws_char
    -> %ws
    |  "\n"


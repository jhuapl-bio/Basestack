
@{%
    const moo = require("moo"); 
    const {lexer} = require("../lexer.js");
%}

@lexer lexer 



expression -> number _ "*" _ number {% ([a, _, b]) => a * b %}


_ml -> multi_line_ws_char:*

multi_line_ws_char
    -> %ws
    |  "\n"

__ -> %ws:+

_ -> %ws:*
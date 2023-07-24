@{%
    const moo = require('moo');

    let lexer = moo.compile({
        ws: /[ \t]+/,
        nl: { match: "\n", lineBreaks: true },
        lte: "<=",
        lt: "<",
        gte: ">=",
        gt: ">",
        eq: "==",
        log10:  "log10",
        tan: "tan",
        lparan: "(",
        rparan: ")",
        comma: ",",
        lbracket: "[",
        rbracket: "]",
        lbrace: "{",
        rbrace: "}",
        plus: "+",
        minus: "-",
        multiply: "*",
        divide: "/",
        power: "^",
        modulo: "%",
        colon: ":",
        assignment: "=",
        semicolon: ";",
        comment: {
            match: /#[^\n]*/,
            value: s => s.substring(1)
        },
        number: {
            match: /[0-9]+(?:\.[0-9]+)?/,
            value: s => Number(s)
        },
        string: {
            match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/,
            value: s => JSON.parse(s)
        },
        variable: /[a-zA-Z][a-zA-Z0-9_]*/,
        op: /[\+\-\*\/]/,
        NL: { match: /\n/, lineBreaks: true },
    });
%}

@lexer lexer 

@{%

    function tokenStart(token) {
        console.log(token,"<<<<")
        return {
            line: token.line,
            col: token.col - 1
        };
    }

    function tokenEnd(token) {
        const lastNewLine = token.text.lastIndexOf("\n");
        if (lastNewLine !== -1) {
            throw new Error("Unsupported case: token with line breaks");
        }
        return {
            line: token.line,
            col: token.col + token.text.length - 1
        };
    }

    function convertToken(token) {
        return {
            type: token.type,
            value: token.value,
            start: tokenStart(token),
            end: tokenEnd(token)
        };
    }
    function convertTokenId(data) {
        return convertToken(data[0]);
    }
    function convertValue(data){
        return data[0].value
    }

%}

input -> top_level_statements {% id %} 


top_level_statements
    ->  top_level_statement
        {%
            ([d]) =>
            { 
                return [d]
            }

        %}
    |  top_level_statement _ "\n" _ top_level_statements
        {%
            ([d,,,,x]) =>
            { 
                return [ 
                    d[0],
                    ...x
                ]
            }
        %}
    # below 2 sub-rules handle blank lines
    |  _ "\n" top_level_statements
        {%
            ([d]) =>
            { 
                return d[2]
            }
        %}
    |  _
        {%
            d => []
        %}

top_level_statement ->  
    string  
    | number 
    | proc_definition

proc_definition
    ->  _ code_block _
        {%
            d => ({
                type: "proc_definition",
                name: d[2],
                parameters: d[6],
                body: d[10],
                start: tokenStart(d[0]),
                end: d[10].end
            })
        %}
code_block -> "{" executable_statements "}"
    {%
        (d) => ({
            type: "code_block",
            statements: d[1],
            start: tokenStart(d[0]),
            end: tokenEnd(d[2])
        })
    %}
executable_statements
    -> _
        {% () => [] %}
    |  _ "\n" executable_statements
        {% (d) => { console.log(d, "inside"); return d[2] } %}
    |  _ executable_statement _
        {% d => [d[1]] %}
    |  _ executable_statement _ "\n" executable_statements
        {%
            (d) => { console.log(d, "inside4"); return [d[1], ...d[4]] }
        %}

executable_statement
   -> return_statement {%
            ([d]) => { console.log(d, "inside4"); return d[0] }
        %}
expression -> boolean_expression {% id %} 

boolean_expression
    -> comparison_expression     {% id %}
    |  comparison_expression _ boolean_operator _ boolean_expression
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4],
                start: d[0].start,
                end: d[4].end
            })
        %}

boolean_operator
    -> "and"      {% id %}
    |  "or"       {% id %}

comparison_expression
    -> additive_expression    {% id %}
    |  additive_expression _ comparison_operator _ comparison_expression
        {%
            d => ({
                type: "binary_operation",
                operator: d[2],
                left: d[0],
                right: d[4],
                start: d[0].start,
                end: d[4].end
            })
        %}

comparison_operator
    -> ">"   {% convertTokenId %}
    |  ">="  {% convertTokenId %}
    |  "<"   {% convertTokenId %}
    |  "<="  {% convertTokenId %}
    |  "=="  {% convertTokenId %}

additive_expression
    -> multiplicative_expression    {% id %}
    |  multiplicative_expression _ [+-] _ additive_expression
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4],
                start: d[0].start,
                end: d[4].end
            })
        %}

multiplicative_expression
    -> unary_expression     {% id %}
    |  unary_expression _ [*/%] _ multiplicative_expression
        {%
            d => ({
                type: "binary_operation",
                operator: convertToken(d[2]),
                left: d[0],
                right: d[4],
                start: d[0].start,
                end: d[4].end
            })
        %}

unary_expression
    -> number               {% id %}
    |  identifier
        {%
            d => ({
                type: "var_reference",
                var_name: d[0],
                start: d[0].start,
                end: d[0].end
            })
        %}
    |  call_expression      {% id %}
    |  string       {% id %}
    |  list_literal         {% id %}
    |  dictionary_literal   {% id %}
    |  boolean_literal      {% id %}
    |  indexed_access       {% id %}
    |  "(" expression ")"
        {%
            data => data[1]
        %}

list_literal
    -> "[" list_items "]"
        {%
            d => ({
                type: "list_literal",
                items: d[1],
                start: tokenStart(d[0]),
                end: tokenEnd(d[2])
            })
        %}

list_items
    -> null
        {% () => [] %}
    |  _ml expression _ml
        {% d => [d[1]] %}
    |  _ml expression _ml "," list_items
        {%
            d => [
                d[1],
                ...d[4]
            ]
        %}

dictionary_literal
    -> "{" dictionary_entries "}"
        {%
            d => ({
                type: "dictionary_literal",
                entries: d[1],
                start: tokenStart(d[0]),
                end: tokenEnd(d[2])
            })
        %}

dictionary_entries
    -> null  {% () => [] %}
    |  _ml dictionary_entry _ml
        {%
            d => [d[1]]
        %}
    |  _ml dictionary_entry _ml "," dictionary_entries
        {%
            d => [d[1], ...d[4]]
        %}

dictionary_entry
    -> identifier _ml ":" _ml expression
        {%
            d => [d[0], d[4]]
        %}

boolean_literal
    -> "true"
        {%
            d => ({
                type: "boolean_literal",
                value: true,
                start: tokenStart(d[0]),
                end: tokenEnd(d[0])
            })
        %}
    |  "false"
        {%
            d => ({
                type: "boolean_literal",
                value: false,
                start: tokenStart(d[0]),
                end: tokenEnd(d[0])
            })
        %}
call_statement -> call_expression  {% id %}
argument_list
    -> null {% () => [] %}
    |  _ expression _  {% d => [d[1]] %}
    |  _ expression _ "," argument_list
        {%
            d => [d[1], ...d[4]]
        %}
call_expression
    -> identifier _ "(" argument_list ")"
        {%
            d => ({
                type: "call_expression",
                fun_name: d[0],
                arguments: d[3],
                start: d[0].start,
                end: tokenEnd(d[4])
            })
        %}

indexed_access
    -> unary_expression _ "[" _ expression _ "]"
        {%
            d => ({
                type: "indexed_access",
                subject: d[0],
                index: d[4],
                start: d[0].start,
                end: tokenEnd(d[6])
            })
        %}

indexed_assignment
    -> unary_expression _ "[" _ expression _ "]" _ "=" _ expression
        {%
            d => ({
                type: "indexed_assignment",
                subject: d[0],
                index: d[4],
                value: d[10],
                start: d[0].start,
                end: d[10].end
            })
        %}
return_statement
   -> "return" __ expression _ ";"
       {%
           ([,,d,,]) => {
                console.log("d____", d[0])
                return {
                    type: "return_statement",
                    value: d[2],
                    start: tokenStart(d[0]),
                    end: d[2].end
                }
           }
       %}
line_comment -> %comment {% convertTokenId %}

string  -> %string  {% convertTokenId %}

number -> %number  {% convertTokenId %}

identifier -> %identifier {% convertTokenId %}

_ml -> multi_line_ws_char:*

multi_line_ws_char
    -> %ws
    |  "\n"

__ -> %ws:+

_ -> %ws:*

# # Start with the highest level rules.
# Program -> MathExpressions

# StatementList -> StatementList Statement
#     | Statement

# Statement -> AssignmentStatement
#     | IfStatement
#     | ForStatement
#     | ExpressionStatement
#     | MathExpressions
#     | Literal {% id %} 


# Literal -> %string {% ([literal]) => literal.value %} | %number {% ([n]) => Number(n) %}

# AssignmentStatement -> _ %identifier _ %assignment _ Expression _ %semicolon
#     | %identifier %assignment Array %semicolon
#     | %identifier %assignment Dictionary %semicolon
# ExpressionStatement -> Expression %semicolon

# Expression -> %number
#     | %string
#     | VariableReference
#     | FunctionCall
#     | ArrayReference
#     | DictionaryReference
#     | VariableReference
#     | Expression %op Expression
#     | MathExpressions

# MathExpressions -> MathExpression MathExpressions
#     | MathExpression

# MathExpression -> multiplication
#     | division
#     | addition
#     | power
#     | subtraction
#     | squareRoot
#     | logarithm
#     | tangent

# multiplication -> _ %number _ %multiply _ %number {% ([,first,,,,second]) => first * second %}
# division -> _ %number _ %divide _ %number {% ([,first,,,,second]) => first / second %}
# addition -> _ %number _ %plus _ %number {% ([,first,,,,second]) => first + second %}
# subtraction -> _ %number _ %minus _ %number {% ([,first,,,,second]) => first - second %}
# power -> _ %number _ %power _ %number {% ([,first,,,,second]) => Math.pow(first, second) %}

# # Math functions:
# squareRoot -> "sqrt" %lparen %number %rparen {% ([, , x]) => Math.sqrt(Number(x.value)) %}
# logarithm -> "log" %lparen %number %rparen {% ([, , x]) => Math.log(Number(x.value)) %}
# tangent -> "tan" %lparen %number %rparen {% ([, , x]) => Math.tan(Number(x.value)) %}


# FunctionCall -> %identifier %lparen ArgList %rparen

# ArgList -> ArgList %comma Expression
#     | Expression
#     | null

# ArrayReference -> %identifier %lbracket Expression %rbracket
# VariableReference -> %identifier

# DictionaryReference -> %identifier %lbrace Expression %rbrace

# Dictionary -> %lbrace DictEntryList %rbrace

# DictEntryList -> DictEntryList %comma DictEntry
#     | DictEntry

# DictEntry -> %identifier %colon Expression

# IfStatement -> "if" %lparen Expression %rparen Block "else" Block
#             |  "if" %lparen Expression %rparen Block

# Block -> %lbrace StatementList %rbrace

# ForStatement -> "for" %identifier "in" %identifier Block

# Array -> %lbracket ElementList %rbracket

# ElementList -> ElementList %comma Expression
#     | Expression

# __ -> %ws:+

# _ -> %ws:*

# _ml -> multi_line_ws_char:*

# multi_line_ws_char -> %ws |  "\n"
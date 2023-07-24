@{%
    const myLexer = require("../lexer");
%}

@lexer myLexer

main -> root 

root -> object:*
    {% (data) => { 
            return {
                type: 'root', data: data[0]
            }
        } 
    %}

object -> 
    lbrace _ml pair (comma _ml pair):* _ml rbrace  
    {% ([, , first, rest]) => { 
        const repeated = rest[0];
        if (repeated){
            return {
                type: 'object', 
                data: [first, ...rest.map(([, , pair]) => pair)]
            }
        } else {
            return {
                type: 'object', 
                data: [first ]
            }
        }
    } %}

pair ->  # pair is a string identifier follow by assignment token colon: then any number of whitespace (same line) then the expression
    %string colon expression
    {% ([key, , value]) => { 
            return { 
                type: 'pair', 
                key: JSON.parse(key), 
                value: value[0] ? value[0] : value
            }
        }
    %}


colon -> %colon _ {% id %}

array ->
    lbracket   expression (comma expression):*    rbracket
    {% 
        ([, first, rest]) => {
            return { type: 'array', data: [first, ...rest.map(([,expr]) => expr)] }
        }
    %}

expression ->
   function_call
  | array
  | object
  | function_call expression    {% ([call, expr]) => {
                                 return { 
                                   type: 'concatFunctionCall', 
                                   call, 
                                   expr 
                                 }; 
                               } %}
  | array_access
  | lparen expression rparen    {% ([, expr]) => expr %}
  | %identifier                 {% id %}
  | %string                     {% ([s]) => ({ type: 'literalstring', value: JSON.parse(s) }) %}
  | %number                     {% ([n]) => ({ type: 'literalnumber', value: Number(n) }) %}
  

array_access ->
    %identifier lbrace _ml expression rbracket
    {% ([id, , index]) => ({ type: 'arrayAccess', id, index }) %}

function_call ->
    %identifier lparen rparen
    {% ([name, , args]) => {
            console.log(name,"::::")
            const functionName = name;
            const functionArguments = args;
            switch (functionName) {
                case 'uppercase':
                    
                    return { 
                        type: 'functionCall', 
                        name: functionName, 
                        value: functionArguments.map(arg => arg.value.toUpperCase()) 
                    };
                case 'lowercase':
                    return { 
                        type: 'functionCall', 
                        name: functionName, 
                        value: functionArguments.map(arg => arg.value.toLowerCase()) 
                    };
                default:
                    throw new Error(`Unknown function: ${functionName}`);
            }
        } 
    %}
function_args -> 
    expression (comma expression):* 
    {% ([first, rest]) => {
            console.log(first, rest, "args")
            return [first, ...rest.map(([, expr]) => expr)]
        } 
    %}

function_name -> %string   {% id %}
lparen -> %lparan      {% id %}
rparen -> %rparan      {% id %}
comma -> %comma        {% id %}
lbrace -> %lbrace   {% id %}
rbrace -> %rbrace   {% id %}
rbracket -> %rbracket   {% id %}
lbracket -> %lbracket  {% id %}


# Mandatory line-break with optional whitespace around it
__lb_ -> (_ %nl):+ _

# Optional multi-line whitespace
_ml -> (%ws | %nl):*

# Mandatory multi-line whitespace
__ml -> (%ws | %nl):+

# Optional whitespace    
_ -> %ws:*

# Mandatory whitespace
__ -> %ws:+

_nl -> (%ws %nl %ws):?


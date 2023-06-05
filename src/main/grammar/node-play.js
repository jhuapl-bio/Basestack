const moo = require('moo')

let data = `version: 1.5`

const lexer  = require("../lexer").lexer
lexer.reset(data)
let token; 
while (token = lexer.next()){
    console.log(token)
}
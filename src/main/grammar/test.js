const grammar = require("./grammar.js")
const nearley = require("nearley")

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
let target = `version: 1.5`
console.log(target)
parser.feed(target);
console.log(parser.results)

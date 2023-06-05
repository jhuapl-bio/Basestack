
var { store } = require("./store.js");
const grammar = require("./grammar/grammar.js")
const nearley = require("nearley")
const {lexer} = require("./lexer")

export class Variable {
    target: string
    stack: string
    parses: String[]
    lexer: any
    constructor(target, stack) {
        this.stack = stack
        this.lexer = lexer
        this.target = target
        // this.splitTarget()
        this.parse()
        this.parses = []
    }
    parse(){
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
        this.target = "1000 * 100"
        parser.feed(this.target);
        console.log(parser.results)
        return 
    }
    basename(val: string){
        return path.basename(val)
    }
    trim(val: string){
        return path.parse(path.basename(val)).name
    }
    directory(val: string){
        return path.dirname(val)
    }
    first(val: string){
        return val.split(" ")[0]
    }
    last(val: string){
        return val.split(" ")[-1]
    }
    length(val: string){
        return val.length
    }
    join(val: string, sep: string | undefined){
        sep ? sep = "," : ''
        val ? val = "" : ''
        return val.split(" ").join(sep)

    }
    splitTarget() {
        let functions = [
            'basename', 
            'trim',
            'directory', 
            'first',
            'last',
            'sum',
            'length', 
            'join'
        ]
        let continuation = true 
        let lastnonfunc: string | undefined
        this.lexer.reset(this.target)
        while (continuation){
            continuation = this.lexer.next()
            if (continuation)    {
                if (continuation['type'] == 'func' && lastnonfunc ){
                    console.log(continuation, lastnonfunc)
                } else if(continuation['type'] == 'variable') {
                    console.log(continuation, lastnonfunc)
                } else {
                    lastnonfunc = continuation['value']
                }
            }
        }
    }
    
}
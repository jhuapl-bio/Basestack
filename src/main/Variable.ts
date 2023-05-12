
var { store } = require("./store.js");
export class Variable {
    target: string
    stack: string
    parses: String[]

    constructor(target, stack) {
        this.stack = stack
        this.target = target
        this.splitTarget()
        this.parses = []
    }
    splitTarget() {
        let target = this.target.trim().split(" ")
        console.log(target, ":::")
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
        target.forEach((designation: string) => {
            var regex = /\$\{.+\}.*/g
            const $this = this
            let fo = String(designation).match(regex)
            if (fo && Array.isArray(fo)) {
                let de = fo[0]
                
                var regex2 = /\$\{.+\}/g
                let fo2 = String(de).match(regex2)
                if (fo2 && Array.isArray(fo2)) {
                    let de2 = fo2[0]
                    console.log(fo2)
                    de2 = de2.replace(/\$\{/g, "")
                    de2 = de2.replace(/\}/g, "")
                    var regex3 = /\.[^\.]+?\(.*?\)/g
                    var regex4 = /^[^.]*/g
                    let fo3 = String(de2).match(regex3)
                    let fo4 = String(de2).match(regex4)
                    console.log(fo4)
                    if (fo3 && Array.isArray(fo3)) {
                        let extras: String[] = []
                        fo3.map((entry2: string) => {
                            let de3 = entry2
                            de3 = de3.replace(/\.|\(\)/g, "")
                            if (functions.indexOf(de3) > -1) {
                                extras.push(de3)
                            }
                        })
                        $this.parses = extras
                    } else {

                    }
                }
            }
        })
        console.log("______")
    }
    
}


export class Variable {
    target: string
    stack: string
    parses: String[]
    constructor(target, stack) {
        this.stack = stack
        this.target = target
        // this.splitTarget()
        this.parses = []
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
    
    
}
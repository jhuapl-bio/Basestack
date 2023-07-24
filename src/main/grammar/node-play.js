const YAML = require('yaml');
const lodash = require('lodash');
const nearley = require("nearley");
const fs = require("fs/promises")
const util = require("util")
const exec = util.promisify(require('child_process').exec)
const path = require("path")


function generateJsForStatements(statements) {
    const lines = [];
    console.log(statements,"<<<")
    for (let statement of statements) {
        const line = generateJsForStatementOrExpr(statement);
        lines.push(line);
    }
    return lines.join("\n");
}

function generateJsForStatementOrExpr(node) {
    if (node.type === "var_assign") {
        const varName = node.var_name.value;
        const jsExpr = generateJsForStatementOrExpr(node.value);
        const js = `var ${varName} = ${jsExpr};`;
        return js;
    } else if (node.type === "fun_call") {
        let funName = node.fun_name.value;
        if (funName === "if") {
            funName = "$if";
        }
        const argList = node.arguments.map((arg) => {
            return generateJsForStatementOrExpr(arg);
        }).join(", ");
        return `${funName}(${argList})`;
    } else if (node.type === "string") {
        return node.value;
    } else if (node.type === "number") {
        return node.value;
    } else if (node.type === "identifier") {
        return node.value;
    } else if (node.type === "lambda") {
        const paramList = node.parameters
            .map(param => param.value)
            .join(", ");
        const jsBody = node.body.map((arg, i) => {
            const jsCode = generateJsForStatementOrExpr(arg);
            if (i === node.body.length - 1) {
                return "return " + jsCode;
            } else {
                return jsCode;
            }
        }).join(";\n");
        return `function (${paramList}) {\n${indent(jsBody)}\n}`;
    } else if (node.type === "comment") {
        return "";
    } else {
        throw new Error(`Unhandled AST node type ${node.type}: ${JSON.stringify(node)}`);
    }
}

function indent(string) {
    return string.split("\n").map(line => "    " + line).join("\n");
}


function generateJsForStatements(statements) {
    const lines = [];
    for (let statement of statements) {
        const line = generateJsForStatementOrExpr(statement);
        lines.push(line);
    }
    return lines.join("\n");
}
async function myExec(command){
    const output = await(exec(command))
    if (output.stdout){
        process.stdout.write(output.stdout)
    } 
    if (output.stderr){
        process.stderr.write(`ERROR in exec command ${command}: \n\t${output.stderr}`)
    }
    return 
}

// A set of available functions
const funcs = {
    uppercase: (s) => s.toUpperCase()
  };
  
  // Function to resolve a reference into an actual value
  function resolveRef(ref, obj) {
    const parts = ref.split('.');
    let value = obj;
    for (let part of parts) {
      if (value instanceof Array) {
        value = value[Number(part)];
      } else {
        value = value[part];
      }
    }
    return value;
  }

function interpret(ast, data) {
   
    switch (ast.type) {
        case 'identifier':
            
            return data[ast.value];
        case 'arrayAccess':
            return interpret(ast.id, data)[interpret(ast.index, data)];
        case 'functionCall':
            const args = ast.args.map(arg => interpret(arg, data));
            console.log(args)
            const fn = functions[ast.name];
            return fn(...args);
        case 'literalstring':
            return ast.value;
        case 'literalnumber':
                return ast.value;
        case 'pair':
            let newObj = {};
            // console.log("\n\tast: ", ast,"\n\t")
            newObj[ast.key] = interpret(ast.value, data);
            return newObj;
        case 'array':
            return ast.data.map(item => interpret(item, data));
        case 'object':
            return Object.assign({}, ...ast.data.map(pair => interpret(pair, data)));
        case 'root':
            return Object.assign({}, ...ast.data.map(pair => interpret(pair, data)));
        default:
            throw new Error(`Unknown AST node type ${JSON.stringify(ast, null, 4)}`);
    }
}

async function main(){
    
    const filename = process.argv[2];
    if (!filename ){
        console.error("Please provide a .json or YAML file")
        return 
    }
    let code = (await fs.readFile(filename,  'utf8'))
     let outputFilename=""
    if (path.parse(filename).ext =='.json'){
        outputFilename = filename.replace(".json", ".ast")
    } else {
        outputFilename = filename.replace(".yaml", ".ast")
        code = YAML.parse(code)
    }
    const codeString = JSON.stringify(code )
    // console.log(code)
    // const codeString = code.toString()
     let grammarFile = await compileGrammar()
    const grammar = require(grammarFile); 
    const runtimeJSFile = `${path.join(__dirname, '../grammar/runtime.js')}`
    const runtimeJs = (await fs.readFile(runtimeJSFile)).toString()
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    let results = parser.feed(codeString)
    let ast = await makeAst(results.results, outputFilename)
    
    console.log("_______________START__________")
    // console.log(JSON.stringify(ast[0].data[0], null, 4) )
    let parsed = interpret(ast[0] , code )
    // let parsed = generateJsForStatements(ast[0]) + "\n" + runtimeJs
    // Post-process the parsed output
    console.log("\n\n\n\t",parsed,"parsed")
    return 
}

async function compileGrammar(){
    const parser_binary = `${path.join(__dirname, './../../../node_modules/nearley/bin/nearleyc.js')}`
    const ne_file = `${path.join(__dirname, './../../grammar/grammar.ne')}`
    const grammarFile = `${path.join(__dirname, '../grammar/grammar.js')}`
    await myExec(`node ${parser_binary} ${ne_file} -o ${grammarFile}`)
    return grammarFile
}

async function makeAst(results, outputFilename){
    if (results.length > 1){
        console.error("ERR: ambiguous grammar detected")
        for (let i =0; i < results.length; i++){
            const ast = results[i]
            let indexfilename = outputFilename.replace(".ast", "."+i+".ast")
            await fs.writeFile(indexfilename, JSON.stringify(ast, 4, "  "))
            console.log(`Wrote to ambiguous file: ${indexfilename}`)
        }
        throw new Error("Ambigious set of files returned, exiting....")
    } else if (results.length == 1){
        const ast = results[0]
        
        await fs.writeFile(outputFilename, JSON.stringify(ast, 4, "  "))
        console.log(`Wrote: ${outputFilename}`)
        return ast
    } else {
        console.error("ERR: Parse incompleted, no parse found.")
        throw new Error("ERR: Parse incompleted, no parse found.")
    }
}

async function mainBst(){
    const filename = process.argv[2];
    if (!filename ){
        console.error("Please provide a .bst file")
        return 
    }
    const code = (await fs.readFile(filename)).toString()
    const runtimeJSFile = `${path.join(__dirname, '../grammar/runtime.js')}`
    const outputFilename = filename.replace(".bst", ".ast")
    const outputFilenameJS = outputFilename.replace(".ast", ".parsed.js")
    const runtimeJs = (await fs.readFile(runtimeJSFile)).toString()
    let grammarFile = await compileGrammar()
    const grammar = require(grammarFile); 
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    let results = parser.feed(code)
    let ast = await makeAst(results.results, outputFilename)
    const jsCode = generateJsForStatements(ast) + "\n" + runtimeJs
    await fs.writeFile(outputFilenameJS, jsCode)
    console.log(`Wrote: ${outputFilenameJS}`)
    // console.log(JSON.stringify(generateJsForStatements(ast),4, '  '))
    await myExec(`node ${outputFilenameJS}`)
    
}


main().catch((err)=>{
    console.error(err.stack)
})
import _ from 'lodash';

// Define functions that can be called from the shorthand
const functions = {
    basename: window.electronAPI.basename,
    trim: window.electronAPI.trim,
    uppercase: window.electronAPI.uppercase,
    lowercase: window.electronAPI.lowercase,
    directory: window.electronAPI.directory,
    join: (...args) => args.slice(1).join(args[0]),
    // define other functions here...
}
function resolveShorthand(obj, context) {
    let result = JSON.parse(JSON.stringify(obj)); // Create a deep clone of the original object
    // Deep iterate over object properties
    function iterate(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (typeof obj[prop] === 'object') {
                    iterate(obj[prop]);
                } else if (typeof obj[prop] === 'string') {
                    obj[prop] = interpolate(obj[prop], context);
                }
            }
        }
    }

    iterate(result);
    return result;
    
}

const interpolate = (expr, context) => {
    // const variablePattern = /%?([$@][\w.]+)%?/g;
    const variablePattern = /([$@][\w.]+)|[^%]+/g;
    const functionPattern = /([\w]+)\((.*?)\)/g;
    // Interpolate variable in the given string
    function interpolateVariable(str) {
        return str.replace(variablePattern, (match, variable) => {
            if (variable) {
                const key = variable.slice(1);
                switch (variable[0]) {
                    case '$': return _.get(context, key, '');
                    case '@': return _.get(context.selectedChoice, key, '');
                    default: return '';
                }
            } else {
                return match;
            }
        });
    }

    function processFunctionCall(funcName, arg) {
        if (_.has(functions, funcName)) {
            // Perform variable interpolation on the argument before invoking the function
            const func = _.get(functions, funcName);
            return func(...arg);
        } else {
            return '';
        }
    }
    function interpolateFunction(str) {
        return str.replace(functionPattern, (match, funcName, args) => {
            let splitArgs = args.split(',').map(arg => arg.trim());
            let interpolatedArgs = splitArgs.map(arg => interpolateVariable(arg));
            return processFunctionCall(funcName, interpolatedArgs);
        });
    }

    // First, interpolate all variables or literals inside %%
    let intermediate = expr.replace(/%(.*?)%/g, (_, group) => '%' + interpolateVariable(group) + '%');
    // Then, call functions on them if present
    let returnable = intermediate.replace(/%(.*?)%/g, (_, group) => interpolateFunction(group).trim());


    return returnable;
}
const splitArguments = (argString) => {
    const args = [];
    let parenCount = 0;
    let lastIdx = 0;
    argString = argString.replace(/["']/g, "")
    for (let i = 0; i < argString.length; i++) {
        if (argString[i] === '(') parenCount++;
            else if (argString[i] === ')') parenCount--;
        if (argString[i] === ',' && parenCount === 0) {
            args.push(argString.substring(lastIdx, i).trim());
            lastIdx = i + 1;
        }
    }
    args.push(argString.substring(lastIdx).trim()); // add the last arg
    return args; 
};
// export interpolation function    
export default resolveShorthand;

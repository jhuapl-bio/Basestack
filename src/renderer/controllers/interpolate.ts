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



// Function to handle custom functions like trim
function handleFunctions(value, data ) {
    return value.replace(/%\$([\w\.]+)%/g, (_, variable) => {
        // Retrieve the value of the variable from the data
        return getDeep(data, variable) || '';
    });
}
export function conditionalSets(data){
    // Interpolate the conditions
    if (data.conditions){
        data.conditions.forEach(condition => {
            let allConditionsTrue;
            
            // Evaluate the condition
            if (condition.if.and) {
                allConditionsTrue = condition.if.and.every(cond => evaluateCondition(data, cond));
            } else if (condition.if.or) {
                allConditionsTrue = condition.if.or.some(cond => evaluateCondition(data, cond));
            } else {
                allConditionsTrue = evaluateCondition(data, condition.if);
            }
        
            // Ensure both `then` and `else` are arrays for consistency
            if (!Array.isArray(condition.then)) {
                condition.then = [condition.then];
            }
            
            if (!Array.isArray(condition.else)) {
                condition.else = [condition.else];
            }
            
            // Process actions based on the condition result
            const actions = allConditionsTrue ? condition.then : condition.else;
            actions.forEach(action => {
                if (action && action['key']) {
                    let valueToSet = handleFunctions(action.value, data);
                    if (valueToSet.includes(`%${action.key}%`)) {
                        // If it includes the placeholder, then we treat this as an append or prepend
                        const currentValue = getDeep(data, action.key);
                        
                        // Here we replace the placeholder with the current value (append or prepend)
                        valueToSet = valueToSet.replace(`%${action.key}%`, currentValue);
                    }
                    setDeep(data, action.key, valueToSet);
                }
            });
        });
    }
    return data
}


// Utility function to get deep properties
function getDeep(obj, pathString) {
    const path = pathString.split('.');
    return path.reduce((acc, current) => (acc && acc[current]) ? acc[current] : null, obj);
}

// Utility function to set deep properties
function setDeep(obj, pathString, value) {
    const path = pathString.split('.');
    if (path.length > 1) {
        if (!obj[path[0]]) obj[path[0]] = {};
        setDeep(obj[path[0]], path.slice(1).join('.'), value);
    } else {
        obj[path[0]] = value;
    }
}

function resolveShorthand(obj, context) {
    if (typeof obj === 'object'){

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
    } else if (typeof obj === 'string') {
        let result  = interpolate(obj, context);
        return result 
    } else {
        return  null
    }
    
}
function evaluateCondition(data, cond) {
    // Handle 'includes' check
    if (cond.includes('.includes(')) {
        let [path, value] = cond.split('.includes(');
        value = value.replace(')', '').trim();
        const arrOrStr = getDeep(data, path.trim());
        
        return arrOrStr && arrOrStr.includes(value);
    }
    // Handle 'length > n' check
    else if (cond.includes('.length >')) {
        let [path, n] = cond.split('.length >');
        const arrOrStr = getDeep(data, path.trim());
        return arrOrStr && arrOrStr.length > parseInt(n, 10);
    }
    else if (cond.includes('!==')) {
        const [left, right] = cond.split('!==').map(s => s.trim());
        return getDeep(data, left) !== right;
    }
    else if (cond.includes('==')) {
        const [left, right] = cond.split('==').map(s => s.trim());
        return getDeep(data, left) === right;
    }
    else {
        return Boolean(getDeep(data, cond));
    }
}

function evaluateAndConditions(data, andConditions) {
    return andConditions.every(cond => evaluateCondition(data, cond));
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
// export interpolation function     and conditionalSet
export {interpolate, resolveShorthand};


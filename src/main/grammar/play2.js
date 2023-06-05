const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const path = require('path');

// Function to retrieve the first letter of a string
function firstLetter(str) {
  return str.charAt(0);
}

function length(arr) {
  return arr.length;
}

function trim(arr) {
  let parsed = path.parse(arr);
  return path.join(parsed.dir, parsed.name);
}

// Function to perform multiplication
function multiply(a, b) {
  return a * b;
}

function sum(a, b) {
  return a + b;
}

function divide(a, b) {
  return a / b;
}

function subtraction(a, b) {
  return a - b;
}

function pow(a, b) {
  return a ** b;
}

function dirname(pathstring) {
  return path.dirname(pathstring);
}

function basename(pathstring) {
  return path.basename(pathstring);
}

// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Track dependencies for each attribute
const dependencies = {};

// Read the YAML file
const yamlFile = fs.readFileSync('config.yaml', 'utf8');

// Parse YAML into JavaScript object
const config = yaml.load(yamlFile);

// Function to recursively resolve references and functions
function processAttributes(obj, parentObj = null) {
  if (_.isObject(obj)) {
    _.forOwn(obj, (value, key) => {
      if (_.isString(value)) {
        const templateSettings = {
          interpolate: /\${(.*?)}/g,
        };
        const interpolatedValue = _.template(value, templateSettings)({
          ...parentObj,
          ...obj,
          firstLetter,
          capitalize,
          multiply,
          basename,
          dirname,
          sum,
          subtraction,
          divide,
          pow,
          length,
          trim,
        });
        obj[key] = interpolatedValue;

        // Add dependencies for attribute key
        const dependentKeys = [];
        interpolatedValue.replace(/\${(.*?)}/g, (match, p1) => {
          dependentKeys.push(p1.split('.')[0]);
        });
        dependencies[key] = dependentKeys;
      } else {
        processAttributes(value, { ...parentObj, ...obj });
      }
    });
  }
}

// Process attributes
processAttributes(config);

// Function to update downstream attributes based on changes to a specific attribute
function updateDownstreamAttributes(attributeKey) {
    const visitedAttributes = new Set();
  
    function updateDependencies(key) {
      if (visitedAttributes.has(key)) {
        return; // Avoid circular dependencies
      }
  
      visitedAttributes.add(key);
  
      const dependentKeys = dependencies[key];
      if (dependentKeys && dependentKeys.length > 0) {
        dependentKeys.forEach((dependentKey) => {
          const value = _.get(config, dependentKey);
          if (_.isString(value)) {
            const templateSettings = {
              interpolate: /\${(.*?)}/g,
            };
            const interpolatedValue = _.template(value, templateSettings)({
              ...config,
              firstLetter,
              capitalize,
              multiply,
              basename,
              dirname,
              sum,
              subtraction,
              divide,
              pow,
              length,
              trim,
            });
            const finalValue = _.template(interpolatedValue, templateSettings)({
              ...config,
              firstLetter,
              capitalize,
              multiply,
              basename,
              dirname,
              sum,
              subtraction,
              divide,
              pow,
              length,
              trim,
            });
            _.set(config, dependentKey, finalValue);
  
            // Recursively update downstream attributes
            updateDependencies(dependentKey);
          }
        });
      }
    }
  
    updateDependencies(attributeKey);
  }

// Update the "person.name" attribute
_.set(config, 'person.name', 'Bane Dough');
// Update downstream attributes
updateDownstreamAttributes('person.name');


// Access the processed attributes
// console.log(config.greeting);
console.log(config.person.name);
console.log(config.firstLetter, 'firstletter'); // should output "B" now
// console.log(config.person.age);
// console.log(config.result);
// console.log(config.Type);
// console.log(config.filePath);
// console.log(config.basename);
// console.log(config.dirname);
// // Access the processed attributes
// console.log(config.choicesChoice.name);
// console.log(config.choicesChoice.age);
// console.log(config.choices[2].name);
// console.log(config.pow, 'power');
// console.log(config.sum, '+');
// console.log(config.subtraction, '-');
// console.log(config.multiply, 'multiple');
// console.log(config.divide, 'divide');
// console.log(config.sumResult, 'sumbase result');
// console.log(config.sumConcat, 'sumbase result');

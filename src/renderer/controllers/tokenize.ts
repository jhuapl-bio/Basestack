import moo from 'moo';

// let lexer = moo.compile({
//   WS: /[ \t]+/,
//   literal: /[^%]+/,
//   reference: /%\$[^%]+/,
//   endReference: /[^%]+%/,
  
// });

function tokenize(expr) {
    
    let lexer = moo.compile({
        outsideLiteral: { match: /[^%]+/, lineBreaks: true },
        variable: { match: /%\s*\$[^%]+\s*%/, lineBreaks: true },
        insideLiteral: { match: /%\s*[^%]+\s*%/, lineBreaks: true },
        startInterpolation: /%/,
        endInterpolation: /%/,
        variableIndicator: /\$/,
        variableName: /[^\s%]+/,
      });
      
      lexer.reset(expr);
      return Array.from(lexer);
}

export default tokenize;
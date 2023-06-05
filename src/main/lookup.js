
var { store } = require("./store.js");
import nestedProperty from "nested-property"


const requestVariable = function (data, module) {
    console.log(data,"<<<")
    let obj = {}
    let variable = data['text'].replace(/[\$\{\}]/g, "")
    Object.defineProperty(obj, data, {
        enumerable: true,    
        get: function(){  //  getter that will update on all value changes if needed
            console.log(store.modules[variable].value," value")
            return store.modules[module][variable].value
        }
    })
    return obj.get
} 

module.exports = { requestVariable }
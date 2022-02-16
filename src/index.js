const CircularObjectWrapper = require("./circularObjectWrapper").CircularObjectWrapper;

/**
 * @callback ConfigReplacerOnCircular
 * @param {CircularObjectWrapper} wrapper
 */

/**
 * @callback ConfigReplacerOnDate
 * @param {Date} date
 */

/**
 * @callback ConfigReplacerOnFunction
 * @param {Function} func
 */

/**
 * @typedef ConfigReplacer
 * @property {ConfigReplacerOnCircular} onCircular
 * @property {ConfigReplacerOnDate} onDate
 * @property {ConfigReplacerOnFunction} onFunction
 */

/**
 * @typedef Config
 * @property {Boolean} original
 * @property {ConfigReplacer} replacer It's only enable when property `original` is false.
 */

/**
 * Copy an object safety.
 * 
 * @param {Object} sourceObject
 * @param {Config} customConfig
 */
function safeCopy(sourceObject, customConfig) {
    /**@type {Config} */
    let config = {
        original: false,
        replacer: {
            onCircular: wrapper => "[Circular]",
            onDate: date => `<Date: ${date.getTime()}>`,
            onFunction: func => `<Function: ${func.name}>`
        }
    };

    if (customConfig) {
        // Config
        ["original"].forEach(key => {
            if (customConfig[key]) {
                config[key] = customConfig[key];
            }
        });

        // ConfigReplacer
        if (customConfig.replacer) {
            ["onCircular", "onDate", "onFunction"].forEach(key => {
                if (customConfig.replacer[key] !== undefined) {
                    config.replacer[key] = customConfig.replacer[key];
                }
            });
        }
    }



    // Store all object wrapper to check which is circular.
    /** @type {Array<CircularObjectWrapper>} */
    let store = [];

    return visit(sourceObject, config.original);

    /**
     * Avoid faulty define getter properties.
     * 
     * @param {Object} obj
     * @param {String} property
     */
    function safeGetValue(obj, property) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            try {
                return obj[property];
            } catch (e) {
                return `[ERROR: ${e.message}]`;
            }
        }

        return obj[property];
    }

    /**
     * Visit all properties.
     * 
     * @param {*} obj
     * @param {Boolean} isOriginal
     * @param {String} [path]
     */
    function visit(obj, isOriginal, path = "") {
        // If this property is Function.
        if (typeof obj === 'function') {
            if (isOriginal) {
                return obj;
            }

            return config.replacer.onFunction(obj);
        }

        // If this property is not object.
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        // If this property is stored. (circular)
        let cc = store.filter(w => w.circularObject === obj);
        if (cc.length !== 0) {
            if (isOriginal) {
                return obj;
            }

            let wrapper = new CircularObjectWrapper(cc[0].reference, ++cc[0].count, obj);

            return config.replacer.onCircular(wrapper);
        }

        store.push(new CircularObjectWrapper(path, 0, obj));

        // If this property is Date.
        if (obj instanceof Date) {
            store.pop();

            if (isOriginal) {
                return obj;
            }

            return config.replacer.onDate(obj);
        }

        /**
         * If an object being stringified has a property named toJSON whose 
         * value is a function, then the toJSON() method customizes JSON 
         * stringification behavior: instead of the object being serialized, 
         * the value returned by the toJSON() method when called will be serialized. 
         * JSON.stringify() calls toJSON with one parameter.
         * 
         * Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
         */
        if (typeof obj.toJSON === 'function') {
            try {
                let functionResult = visit(obj.toJSON(), isOriginal, `${path}.toJson`);
                store.pop();
                return functionResult;
            } catch (e) {
                if (isOriginal) {
                    return obj.toJSON;
                }

                return config.replacer.onFunction(obj);
            }
        }


        // If this property is Array.
        if (Array.isArray(obj)) {
            store.pop();

            let arrayResult = obj.map((each, id) => visit(each, isOriginal, `${path}[${id}]`));

            return arrayResult;
        }

        // Final
        let finalResult = Object.keys(obj).reduce((result, property) => {
            result[property] = visit(safeGetValue(obj, property), isOriginal, `${path}.${property}`);
            return result;
        }, {});

        store.pop();
        return finalResult;
    }
}

module.exports.safeCopy = safeCopy;

let originalObject = {
    get a() {
        return this;
    },
    b: new Date(1600000000000),
    c: function () {
        throw new Error("ERROR_MESSAGE")
    },
    d: function f(x) {
        return 1
    }
};

console.log(safeCopy(originalObject, {
    original: true
}));
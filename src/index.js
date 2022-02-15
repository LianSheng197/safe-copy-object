/**
 * @typedef CircularObjectWrapper
 * @property {String} reference
 * @property {Number} count
 * @property {Object} circularObject
 */

/**
 * @callback ConfigReplacerOnCircular
 * @param {CircularObjectWrapper} wrapper
 */

/**
 * @callback ConfigReplacerOnDate
 * @param {Date} date
 */

/**
 * @callback ConfigReplacerOnError
 * @param {Error} error
 */

/**
 * @callback ConfigReplacerOnFunction
 * @param {Function} func
 */

/**
 * @typedef ConfigReplacer
 * @property {ConfigReplacerOnCircular} onCircular
 * @property {ConfigReplacerOnDate} onDate
 * @property {ConfigReplacerOnError} onError
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
 * @param {Object} obj
 * @param {Config} cfg
 */
 function safeCopy(obj, cfg) {
    /**@type {Config} */
    let config = {
        original: false,
        replacer: {
            onCircular: wrapper => "[Circular]",
            onDate: date => `<Date: ${date}>`,
            onError: error => `<Error: ${error.name}, ${error.message}>`,
            onFunction: func => `<Function: ${func.name}>`
        }
    }

    if (cfg) {
        // Config
        ["original"].forEach(key => {
            if (cfg[key]) {
                config[key] = cfg[key]
            }
        });

        // ConfigReplacer
        if (cfg.replacer) {
            ["onCircular", "onDate", "onError", "onFunction"].forEach(key => {
                if (cfg.replacer[key] !== undefined) {
                    config.replacer[key] = cfg.replacer[key];
                }
            });
        }
    }
}

module.exports.safeCopy = safeCopy;
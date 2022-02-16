class CircularObjectWrapper {
    /**
     * @param {String} reference
     * @param {Number} thisCount
     * @param {Object} circularObject
     */
    constructor(reference, thisCount, circularObject) {
        this.reference = reference;
        this.count = thisCount;
        this.circularObject = circularObject;
    }
}

module.exports = CircularObjectWrapper;
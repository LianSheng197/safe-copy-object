const jestGlobal = require("@jest/globals");
const describe = jestGlobal.describe;
const it = jestGlobal.it;
const expect = jestGlobal.expect;

const safeCopy = require("../src").safeCopy;

describe("Safe copy", () => {
    let original = {
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

    it("Using default config", () => {
        let result = safeCopy(original);
        let resultString = JSON.stringify(result);

        expect(resultString).toEqual('{"a":"[Circular]","b":"<Date: 1600000000000>","c":"<Error: Error, ERROR_MESSAGE","d":"<Function: f>"}');
    });

    it("Using custom config (original is false)", () => {
        let result = safeCopy(original, {
            original: false,
            replacer: {
                onCircular: wrapper => `[CUSTOM_CIRCULAR - thisCount: ${wrapper.count}, firstRef: ${wrapper.reference}]`,
                onDate: date => date.getTime(),
                onError: error => error.message,
                onFunction: func => "[CUSTOM_FUNCTION]",
                thisKeyIsNotSupport: "This key is not support"
            }
        });

        let resultString = JSON.stringify(result);

        expect(result).toEqual('{"a":"[CUSTOM_CIRCULAR - thisCount: 1, firstRef: .]","b":1600000000000,"c":"ERROR_MESSAGE","d":"[CUSTOM_FUNCTION]"}');
    });

    it("Using custom config (original is true)", () => {
        let result = safeCopy(original, {
            original: true
        });

        expect(result.a).toEqual(result);
        expect(result.b.getTime()).toEqual(original.b.getTime());
        expect(result.c).toThrow("ERROR_MESSAGE");
        expect(result.d.name).toEqual(original.d.name);
    });
});
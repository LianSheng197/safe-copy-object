const jestGlobal = require("@jest/globals");
const describe = jestGlobal.describe;
const it = jestGlobal.it;
const expect = jestGlobal.expect;

const safeCopy = require("../src").safeCopy;

describe("Safe copy", () => {
    let original = {
        get a() {
            return original;
        },
        b: new Date(),
        c: function () {
            throw new Error("ERROR_MESSAGE")
        },
        d: function func(x) {
            return 1
        }
    };

    it("Using default config", () => {
        let result = safeCopy(original);

        expect(result).toEqual("");
    });

    it("Using custom config (original is false)", () => {
        let result = safeCopy(original, {
            original: false,
            replacer: {
                onCircular: wrapper => "[CUSTOM_CIRCULAR]",
                onDate: date => date.getTime(),
                onError: error => error.message,
                onFunction: func => "[CUSTOM_FUNCTION]",
                thisKeyIsNotSupport: "This key is not support"
            }
        });

        expect(result).toEqual("");
    });

    it("Using custom config (original is true)", () => {

    });
});
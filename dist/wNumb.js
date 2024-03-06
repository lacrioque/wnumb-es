var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export function strReverse(a) {
    return a
        .split("")
        .reverse()
        .join("");
}
export function strStartsWith(input, match) {
    return input.substring(0, match.length) === match;
}
export function strEndsWith(input, match) {
    return input.slice(-1 * match.length) === match;
}
export function throwEqualError(F, a, b, message) {
    if ((F[a] || F[b]) && F[a] === F[b]) {
        throw new Error("Error: ".concat(message || "").concat(a));
    }
}
export function isValidNumber(input) {
    return typeof input === "number" && isFinite(input);
}
export function toFixed(value, exp) {
    var split = value.toString().split("e");
    var rounded = Math.round(+(split[0] + "e" + (split[1] ? +split[1] + exp : exp)));
    var roundedSplit = rounded.toString().split("e");
    return (+(roundedSplit[0] +
        "e" +
        (roundedSplit[1] ? +roundedSplit[1] - exp : -exp))).toFixed(exp);
}
var wNumb = (function () {
    function wNumb(options) {
        this._options = options = this.validate(options);
    }
    wNumb.prototype.formatTo = function (input, options) {
        var originalInput = input, inputIsNegative, inputPieces, inputBase, inputDecimals = "", output = "";
        input = options.encoder(input);
        if (!isValidNumber(input)) {
            return undefined;
        }
        if (parseFloat(input.toFixed(options.decimals)) === 0) {
            input = 0;
        }
        if (input < 0) {
            inputIsNegative = true;
            input = Math.abs(input);
        }
        var inputAsString;
        inputAsString = toFixed(input, options.decimals);
        inputAsString = input.toString();
        inputBase = input + "";
        if (inputAsString.indexOf(".") !== -1) {
            inputPieces = inputAsString.split(".");
            inputBase = inputPieces[0];
            inputDecimals = options.mark + inputPieces[1];
        }
        if (options.thousand) {
            var inputBaseThousandSplit = strReverse(inputBase).match(/.{1,3}/g) || [
                inputBase
            ];
            inputBase = strReverse(inputBaseThousandSplit.join(strReverse(options.thousand)));
        }
        if (inputIsNegative && options.negativeBefore) {
            output += options.negativeBefore;
        }
        if (options.prefix) {
            output += options.prefix;
        }
        if (inputIsNegative && options.negative) {
            output += options.negative;
        }
        output += inputBase;
        output += inputDecimals;
        if (options.suffix) {
            output += options.suffix;
        }
        output = options.edit(output, originalInput) + "";
        return output;
    };
    wNumb.prototype.formatFrom = function (input, options) {
        var originalInput = input, inputIsNegative, stringOutput = "", output = 0;
        input = options.undo(input);
        if (!input || typeof input !== "string") {
            return undefined;
        }
        if (options.negativeBefore &&
            strStartsWith(input, options.negativeBefore)) {
            input = input.replace(options.negativeBefore, "");
            inputIsNegative = true;
        }
        if (options.prefix && strStartsWith(input, options.prefix)) {
            input = input.replace(options.prefix, "");
        }
        if (options.negative && strStartsWith(input, options.negative)) {
            input = input.replace(options.negative, "");
            inputIsNegative = true;
        }
        if (options.suffix && strEndsWith(input, options.suffix)) {
            input = input.slice(0, -1 * options.suffix.length);
        }
        if (options.thousand) {
            input = input.split(options.thousand).join("");
        }
        if (options.mark) {
            input = input.replace(options.mark, ".");
        }
        if (inputIsNegative) {
            stringOutput += "-";
        }
        stringOutput += input;
        stringOutput = stringOutput.replace(/[^0-9\.\-.]/g, "");
        if (stringOutput === "") {
            return undefined;
        }
        output = Number(stringOutput);
        output = options.decoder(output);
        if (!isValidNumber(output)) {
            return undefined;
        }
        return output;
    };
    wNumb.prototype.defaultDecimals = function (decimals) {
        if (decimals < 0 || decimals > 8) {
            throw new Error("decimal option needs to be between 0 and 8");
        }
        return decimals;
    };
    wNumb.prototype.validate = function (inputOptions) {
        var cleanOptions = {
            decimals: this.defaultDecimals(inputOptions.decimals || 0),
            mark: inputOptions.mark || ".",
            thousand: inputOptions.thousand || "",
            prefix: inputOptions.prefix || "",
            suffix: inputOptions.suffix || "",
            negative: inputOptions.negativeBefore || "-",
            negativeBefore: inputOptions.negativeBefore || "",
            encoder: inputOptions.encoder || (function (v) { return v; }),
            decoder: inputOptions.decoder || (function (v) { return v; }),
            edit: inputOptions.edit || (function (v, o) { return v; }),
            undo: inputOptions.undo || (function (v) { return v; })
        };
        throwEqualError(cleanOptions, "mark", "thousand", "Options 'mark' cannot be the same as option 'thousand' ");
        throwEqualError(cleanOptions, "prefix", "negative", "Options 'prefix' cannot be the same as option 'negative' ");
        throwEqualError(cleanOptions, "prefix", "negativeBefore", "Options 'prefix' cannot be the same as option 'negativeBefore' ");
        return cleanOptions;
    };
    Object.defineProperty(wNumb.prototype, "options", {
        get: function () {
            return __assign({}, this._options);
        },
        set: function (nOpt) {
            this._options = this.validate(nOpt);
        },
        enumerable: false,
        configurable: true
    });
    wNumb.prototype.to = function (input) {
        return this.formatTo(input, this._options);
    };
    wNumb.prototype.from = function (input) {
        return this.formatFrom(input, this._options);
    };
    return wNumb;
}());
export { wNumb };
export default (function (options) { return new wNumb(options); });

/// <reference path='./../typings/node/node.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Validator result
 */
var Result = (function () {
    /**
     *
     */
    function Result() {
        this.errors = [];
    }
    /**
     * Add error code
     */
    Result.prototype.addError = function (code, params) {
        if (!this.hasErrorCode(code)) {
            this.errors.push({
                code: code,
                params: params
            });
        }
    };
    /**
     * Merge result items
     */
    Result.prototype.mergeErrors = function (errors) {
        for (var i = 0; i < errors.length; i++) {
            if (this.hasErrorCode(errors[i].code)) {
                continue;
            }
            this.errors.push(errors[i]);
        }
    };
    /**
     * Get error result items list
     */
    Result.prototype.getErrors = function () {
        return this.errors;
    };
    /**
     * Get is valid result
     */
    Result.prototype.isValid = function () {
        return (this.errors.length > 0) ? false : true;
    };
    /**
     * Has error code
     */
    Result.prototype.hasErrorCode = function (code) {
        for (var i = 0; i < this.errors.length; i++) {
            if (this.errors[i].code === code) {
                return true;
            }
        }
        return false;
    };
    return Result;
})();
exports.Result = Result;
/**
 * Validator abstract
 */
var ValidatorAbstract = (function () {
    /**
     *
     */
    function ValidatorAbstract(options) {
    }
    /**
     * Valid value
     */
    ValidatorAbstract.prototype.valid = function (value, cb) {
        this.validValue(value, cb);
    };
    /**
     * Valid value and get result object
     */
    ValidatorAbstract.prototype.validValue = function (value, cb) {
        cb(new Error('ValidatorAbstract method validValue is abstract method'), null);
    };
    return ValidatorAbstract;
})();
exports.ValidatorAbstract = ValidatorAbstract;
/**
 * Validator string
 */
var ValidatorString = (function (_super) {
    __extends(ValidatorString, _super);
    /**
     *
     */
    function ValidatorString(options) {
        _super.call(this, options);
        this.minLength = (typeof options.minLength === 'number') ? options.minLength : null;
        this.maxLength = (typeof options.maxLength === 'number') ? options.maxLength : null;
    }
    /**
     * Valid value and get result object
     */
    ValidatorString.prototype.validValue = function (value, cb) {
        var res = new Result();
        if (typeof value !== 'string') {
            res.addError(ValidatorString.ERROR_VALUE_IS_NOT_STRING, [value]);
            return cb(null, res);
        }
        if ((this.minLength !== null) && (value.length < this.minLength)) {
            res.addError(ValidatorString.ERROR_VALUE_IS_TOO_SHORT, [value, this.minLength]);
            return cb(null, res);
        }
        if ((this.maxLength !== null) && (value.length > this.maxLength)) {
            res.addError(ValidatorString.ERROR_VALUE_IS_TOO_LONG, [value, this.maxLength]);
            return cb(null, res);
        }
        cb(null, res);
    };
    /**
     * Error code for value is not string
     */
    ValidatorString.ERROR_VALUE_IS_NOT_STRING = 'value_is_not_string';
    /**
     * Error code for value is to short
     */
    ValidatorString.ERROR_VALUE_IS_TOO_SHORT = 'value_is_too_short';
    /**
     * Error code for value is to long
     */
    ValidatorString.ERROR_VALUE_IS_TOO_LONG = 'value_is_too_long';
    return ValidatorString;
})(ValidatorAbstract);
exports.ValidatorString = ValidatorString;
/**
 * Validator regular expression string
 */
var ValidatorRegExp = (function (_super) {
    __extends(ValidatorRegExp, _super);
    /**
     *
     */
    function ValidatorRegExp(options) {
        _super.call(this, options);
        this.regExp = options.regExp;
        this.example = (typeof options.example === 'string') ? options.example : null;
    }
    /**
     * Valid value and get result object
     */
    ValidatorRegExp.prototype.validValue = function (value, cb) {
        var res = new Result();
        if ((typeof value !== 'string') || !this.regExp.test(value)) {
            res.addError(ValidatorRegExp.ERROR_VALUE_IS_VALID_PATTERN, [value, this.example]);
        }
        cb(null, res);
    };
    /**
     * Error code for value is not string
     */
    ValidatorRegExp.ERROR_VALUE_IS_VALID_PATTERN = 'value_is_not_valid_pattern';
    return ValidatorRegExp;
})(ValidatorAbstract);
exports.ValidatorRegExp = ValidatorRegExp;
/**
 * Validator email address
 */
var ValidatorEmail = (function (_super) {
    __extends(ValidatorEmail, _super);
    function ValidatorEmail() {
        _super.apply(this, arguments);
    }
    /**
     * Valid value and get result object
     */
    ValidatorEmail.prototype.validValue = function (value, cb) {
        var res = new Result();
        if ((typeof value !== 'string') || !ValidatorEmail.DEFAULT_EMAIL_EXP.test(value)) {
            res.addError(ValidatorEmail.ERROR_VALUE_IS_NOT_EMAIL, [value]);
        }
        cb(null, res);
    };
    /**
     * Email regular expression
     */
    ValidatorEmail.DEFAULT_EMAIL_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /**
     * Error code for value is not string
     */
    ValidatorEmail.ERROR_VALUE_IS_NOT_EMAIL = 'value_is_not_email';
    return ValidatorEmail;
})(ValidatorAbstract);
exports.ValidatorEmail = ValidatorEmail;
/**
 * Validator number object type
 */
var ValidatorNumber = (function (_super) {
    __extends(ValidatorNumber, _super);
    /**
     *
     */
    function ValidatorNumber(options) {
        _super.call(this, options);
        this.min = (typeof options.min === 'number') ? options.min : null;
        this.max = (typeof options.max === 'number') ? options.max : null;
    }
    /**
     * Valid value and get result object
     */
    ValidatorNumber.prototype.validValue = function (value, cb) {
        var res = new Result();
        if (typeof value !== 'number') {
            res.addError(ValidatorNumber.ERROR_VALUE_IS_NOT_NUMBER, [value]);
            return cb(null, res);
        }
        if ((this.min !== null) && (value < this.min)) {
            res.addError(ValidatorNumber.ERROR_VALUE_IS_TOO_LESS, [value, this.min]);
            return cb(null, res);
        }
        if ((this.max !== null) && (value > this.max)) {
            res.addError(ValidatorNumber.ERROR_VALUE_IS_TOO_GREATER, [value, this.max]);
            return cb(null, res);
        }
        cb(null, res);
    };
    /**
     * Error code for value is not number
     */
    ValidatorNumber.ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_number';
    /**
     * Error code for value is to less
     */
    ValidatorNumber.ERROR_VALUE_IS_TOO_LESS = 'value_is_too_less';
    /**
     * Error code for value is to greater
     */
    ValidatorNumber.ERROR_VALUE_IS_TOO_GREATER = 'value_is_too_greater';
    return ValidatorNumber;
})(ValidatorAbstract);
exports.ValidatorNumber = ValidatorNumber;
/**
 * Validator integer number object type
 */
var ValidatorInteger = (function (_super) {
    __extends(ValidatorInteger, _super);
    function ValidatorInteger() {
        _super.apply(this, arguments);
    }
    /**
     * Valid value and get result object
     */
    ValidatorInteger.prototype.validValue = function (value, cb) {
        _super.prototype.validValue.call(this, value, function (err, res) {
            if (err) {
                return cb(err, null);
            }
            if ((typeof value === 'number') && !value.toString().match(/^(\-)?([0-9]+)$/)) {
                res.addError(ValidatorInteger.ERROR_VALUE_IS_NOT_NUMBER, [value]);
            }
            cb(null, res);
        });
    };
    /**
     * Error code for value is not integer number
     */
    ValidatorInteger.ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_integer_number';
    return ValidatorInteger;
})(ValidatorNumber);
exports.ValidatorInteger = ValidatorInteger;
/**
 * Validator date object
 */
var ValidatorDate = (function (_super) {
    __extends(ValidatorDate, _super);
    function ValidatorDate() {
        _super.apply(this, arguments);
    }
    /**
     * Valid value and get result object
     */
    ValidatorDate.prototype.validValue = function (value, cb) {
        var res = new Result();
        if (!(value instanceof Date)) {
            res.addError(ValidatorDate.ERROR_VALUE_IS_DATE_OBJECT, [value]);
        }
        cb(null, res);
    };
    /**
     * Error code for value is not string
     */
    ValidatorDate.ERROR_VALUE_IS_DATE_OBJECT = 'value_is_not_date_object';
    return ValidatorDate;
})(ValidatorAbstract);
exports.ValidatorDate = ValidatorDate;

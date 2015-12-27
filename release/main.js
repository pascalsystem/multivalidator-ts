/// <reference path='./../typings/node/node.d.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model;
(function (Model_1) {
    /**
     * Validator result
     */
    var Result = (function () {
        /**
         *
         */
        function Result(obj) {
            this.properties = {};
            this.validateObject = null;
        }
        /**
         * Add error code
         */
        Result.prototype.addPropertyResult = function (property, result) {
            if (this.properties[property]) {
                this.properties[property].mergeErrors(result.getErrors());
            }
            else {
                this.properties[property] = result;
            }
        };
        /**
         * Get error result items list
         */
        Result.prototype.getPropertyResult = function (property) {
            if (this.properties[property]) {
                return this.properties[property];
            }
            throw new Error('Not found validator result for property: ' + property);
        };
        /**
         * Get object with key is property name and value is property result
         */
        Result.prototype.getPropertiesResult = function () {
            return this.properties;
        };
        /**
         * Set validate object property values
         */
        Result.prototype.setValidateObject = function (obj) {
            this.validateObject = obj;
        };
        /**
         * Get validate object property values
         */
        Result.prototype.getValidateObject = function () {
            if (this.validateObject === null) {
                throw new Error('Result validator model has not defined validate object property values');
            }
            return this.validateObject;
        };
        /**
         * Get valid properties
         */
        Result.prototype.getValidProperties = function () {
            var properties = [];
            for (var k in this.properties) {
                if (this.properties[k].isValid()) {
                    properties.push(k);
                }
            }
            return properties;
        };
        /**
         * Get is valid result
         */
        Result.prototype.isValid = function () {
            for (var k in this.properties) {
                if (!this.properties[k].isValid()) {
                    return false;
                }
            }
            return true;
        };
        return Result;
    })();
    Model_1.Result = Result;
    /**
     * Model validator
     */
    var Model = (function () {
        /**
         *
         */
        function Model(options) {
            this.properties = options.properties;
            this.extendValidators = (typeof options.extendValidators === 'object') ? options.extendValidators : [];
        }
        /**
         * Valid object properties
         */
        Model.prototype.valid = function (obj, cb) {
            if ((typeof obj !== 'object') || !obj) {
                return cb(new Error('Model validator required not null object'), null);
            }
            var self = this;
            var result = new Result(obj);
            var properties = Object.keys(this.properties);
            this.validByPropertyIdx(0, properties, result, obj, function (err) {
                if (err) {
                    return cb(err, null);
                }
                self.validByExtendValidatorIdx(0, result, obj, function (err) {
                    if (err) {
                        return cb(err, null);
                    }
                    self.createValidatePropertyObject(result, obj, cb);
                });
            });
        };
        /**
         * Valid object property by extend validators
         */
        Model.prototype.validByExtendValidatorIdx = function (idx, result, obj, cb) {
            if (idx < this.extendValidators.length) {
                var self = this;
                this.extendValidators[idx](obj, function (err, property, resultProperty) {
                    if (err) {
                        cb(err);
                    }
                    else {
                        result.addPropertyResult(property, resultProperty);
                        cb(null);
                    }
                });
            }
            else {
                cb(null);
            }
        };
        /**
         * Valid object property by properties index
         */
        Model.prototype.validByPropertyIdx = function (idx, properties, result, obj, cb) {
            if (idx < properties.length) {
                var self = this;
                this.properties[properties[idx]].valid((typeof obj[properties[idx]] === 'undefined') ? undefined : obj[properties[idx]], function (err, propertyResult) {
                    result.addPropertyResult(properties[idx], propertyResult);
                    self.validByPropertyIdx(idx + 1, properties, result, obj, cb);
                });
            }
            else {
                cb(null);
            }
        };
        /**
         * Create validate property object values
         */
        Model.prototype.createValidatePropertyObject = function (result, obj, cb) {
            var properties = result.getValidProperties();
            var validateProperties = {};
            for (var i = 0; i < properties.length; i++) {
                validateProperties[properties[i]] = obj[properties[i]];
            }
            result.setValidateObject(validateProperties);
            cb(null, result);
        };
        return Model;
    })();
    Model_1.Model = Model;
})(Model = exports.Model || (exports.Model = {}));
var Property;
(function (Property_1) {
    /**
     * Schema model
     */
    var Property = (function () {
        /**
         *
         */
        function Property(options) {
            this.validators = (typeof options.validators === 'object') ? options.validators : [];
            this.allowNull = (typeof options.allowNull === 'boolean') ? options.allowNull : false;
            this.allowUndefined = (typeof options.allowUndefined === 'boolean') ? options.allowUndefined : false;
            this.allowEmpty = (typeof options.allowEmpty === 'boolean') ? options.allowEmpty : false;
        }
        /**
         * Valid property value
         */
        Property.prototype.valid = function (value, cb) {
            var result = new Validator.Result();
            if (value === null) {
                if (!this.allowEmpty && !this.allowNull) {
                    result.addError(Property.ERROR_PROPERTY_NOT_ALLOWED_NULL, []);
                }
                cb(null, result);
            }
            else if (value === undefined) {
                if (!this.allowEmpty && !this.allowUndefined) {
                    result.addError(Property.ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED, []);
                }
                cb(null, result);
            }
            else {
                this.validByValidators(0, value, result, cb);
            }
        };
        /**
         * Valid property value by validator
         */
        Property.prototype.validByValidators = function (idx, value, result, cb) {
            if (idx < this.validators.length) {
                var self = this;
                this.validators[idx].valid(value, function (err, res) {
                    if (err) {
                        cb(err, null);
                    }
                    else {
                        var errs = res.getErrors();
                        result.mergeErrors(errs);
                        self.validByValidators(idx + 1, value, result, cb);
                    }
                });
            }
            else {
                cb(null, result);
            }
        };
        /**
         * Error code for property not allowed null
         */
        Property.ERROR_PROPERTY_NOT_ALLOWED_NULL = 'property_not_allowed_null';
        /**
         * Error code for property not allowed undefined
         */
        Property.ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED = 'property_not_allowed_undefined';
        return Property;
    })();
    Property_1.Property = Property;
})(Property = exports.Property || (exports.Property = {}));
var Validator;
(function (Validator) {
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
    Validator.Result = Result;
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
    Validator.ValidatorAbstract = ValidatorAbstract;
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
    Validator.ValidatorString = ValidatorString;
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
    Validator.ValidatorRegExp = ValidatorRegExp;
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
    Validator.ValidatorEmail = ValidatorEmail;
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
    Validator.ValidatorNumber = ValidatorNumber;
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
    Validator.ValidatorInteger = ValidatorInteger;
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
    Validator.ValidatorDate = ValidatorDate;
})(Validator = exports.Validator || (exports.Validator = {}));

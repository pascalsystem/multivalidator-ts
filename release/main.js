
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model;
(function (Model_1) {
    
    var Result = (function () {
        
        function Result(obj) {
            this.properties = {};
            this.validateObject = null;
        }
        
        Result.prototype.addPropertyResult = function (property, result) {
            if (this.properties[property]) {
                this.properties[property].mergeErrors(result.getErrors());
            }
            else {
                this.properties[property] = result;
            }
        };
        
        Result.prototype.getPropertyResult = function (property) {
            if (this.properties[property]) {
                return this.properties[property];
            }
            throw new Error('Not found validator result for property: ' + property);
        };
        
        Result.prototype.getPropertiesResult = function () {
            return this.properties;
        };
        
        Result.prototype.setValidateObject = function (obj) {
            this.validateObject = obj;
        };
        
        Result.prototype.getValidateObject = function () {
            if (this.validateObject === null) {
                throw new Error('Result validator model has not defined validate object property values');
            }
            return this.validateObject;
        };
        
        Result.prototype.getValidProperties = function () {
            var properties = [];
            for (var k in this.properties) {
                if (this.properties[k].isValid()) {
                    properties.push(k);
                }
            }
            return properties;
        };
        
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
    
    var Model = (function () {
        
        function Model(options) {
            this.properties = options.properties;
            this.extendValidators = (typeof options.extendValidators === 'object') ? options.extendValidators : [];
        }
        
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
    
    var Property = (function () {
        
        function Property(options) {
            this.validators = (typeof options.validators === 'object') ? options.validators : [];
            this.allowNull = (typeof options.allowNull === 'boolean') ? options.allowNull : false;
            this.allowUndefined = (typeof options.allowUndefined === 'boolean') ? options.allowUndefined : false;
            this.allowEmpty = (typeof options.allowEmpty === 'boolean') ? options.allowEmpty : false;
        }
        
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
        
        Property.ERROR_PROPERTY_NOT_ALLOWED_NULL = 'property_not_allowed_null';
        
        Property.ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED = 'property_not_allowed_undefined';
        return Property;
    })();
    Property_1.Property = Property;
})(Property = exports.Property || (exports.Property = {}));
var Validator;
(function (Validator) {
    
    var Result = (function () {
        
        function Result() {
            this.errors = [];
        }
        
        Result.prototype.addError = function (code, params) {
            if (!this.hasErrorCode(code)) {
                this.errors.push({
                    code: code,
                    params: params
                });
            }
        };
        
        Result.prototype.mergeErrors = function (errors) {
            for (var i = 0; i < errors.length; i++) {
                if (this.hasErrorCode(errors[i].code)) {
                    continue;
                }
                this.errors.push(errors[i]);
            }
        };
        
        Result.prototype.getErrors = function () {
            return this.errors;
        };
        
        Result.prototype.isValid = function () {
            return (this.errors.length > 0) ? false : true;
        };
        
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
    
    var ValidatorAbstract = (function () {
        
        function ValidatorAbstract(options) {
        }
        
        ValidatorAbstract.prototype.valid = function (value, cb) {
            this.validValue(value, cb);
        };
        
        ValidatorAbstract.prototype.validValue = function (value, cb) {
            cb(new Error('ValidatorAbstract method validValue is abstract method'), null);
        };
        return ValidatorAbstract;
    })();
    Validator.ValidatorAbstract = ValidatorAbstract;
    
    var ValidatorString = (function (_super) {
        __extends(ValidatorString, _super);
        
        function ValidatorString(options) {
            _super.call(this, options);
            this.minLength = (typeof options.minLength === 'number') ? options.minLength : null;
            this.maxLength = (typeof options.maxLength === 'number') ? options.maxLength : null;
        }
        
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
        
        ValidatorString.ERROR_VALUE_IS_NOT_STRING = 'value_is_not_string';
        
        ValidatorString.ERROR_VALUE_IS_TOO_SHORT = 'value_is_too_short';
        
        ValidatorString.ERROR_VALUE_IS_TOO_LONG = 'value_is_too_long';
        return ValidatorString;
    })(ValidatorAbstract);
    Validator.ValidatorString = ValidatorString;
    
    var ValidatorRegExp = (function (_super) {
        __extends(ValidatorRegExp, _super);
        
        function ValidatorRegExp(options) {
            _super.call(this, options);
            this.regExp = options.regExp;
            this.example = (typeof options.example === 'string') ? options.example : null;
        }
        
        ValidatorRegExp.prototype.validValue = function (value, cb) {
            var res = new Result();
            if ((typeof value !== 'string') || !this.regExp.test(value)) {
                res.addError(ValidatorRegExp.ERROR_VALUE_IS_VALID_PATTERN, [value, this.example]);
            }
            cb(null, res);
        };
        
        ValidatorRegExp.ERROR_VALUE_IS_VALID_PATTERN = 'value_is_not_valid_pattern';
        return ValidatorRegExp;
    })(ValidatorAbstract);
    Validator.ValidatorRegExp = ValidatorRegExp;
    
    var ValidatorEmail = (function (_super) {
        __extends(ValidatorEmail, _super);
        function ValidatorEmail() {
            _super.apply(this, arguments);
        }
        
        ValidatorEmail.prototype.validValue = function (value, cb) {
            var res = new Result();
            if ((typeof value !== 'string') || !ValidatorEmail.DEFAULT_EMAIL_EXP.test(value)) {
                res.addError(ValidatorEmail.ERROR_VALUE_IS_NOT_EMAIL, [value]);
            }
            cb(null, res);
        };
        
        ValidatorEmail.DEFAULT_EMAIL_EXP = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        ValidatorEmail.ERROR_VALUE_IS_NOT_EMAIL = 'value_is_not_email';
        return ValidatorEmail;
    })(ValidatorAbstract);
    Validator.ValidatorEmail = ValidatorEmail;
    
    var ValidatorNumber = (function (_super) {
        __extends(ValidatorNumber, _super);
        
        function ValidatorNumber(options) {
            _super.call(this, options);
            this.min = (typeof options.min === 'number') ? options.min : null;
            this.max = (typeof options.max === 'number') ? options.max : null;
        }
        
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
        
        ValidatorNumber.ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_number';
        
        ValidatorNumber.ERROR_VALUE_IS_TOO_LESS = 'value_is_too_less';
        
        ValidatorNumber.ERROR_VALUE_IS_TOO_GREATER = 'value_is_too_greater';
        return ValidatorNumber;
    })(ValidatorAbstract);
    Validator.ValidatorNumber = ValidatorNumber;
    
    var ValidatorInteger = (function (_super) {
        __extends(ValidatorInteger, _super);
        function ValidatorInteger() {
            _super.apply(this, arguments);
        }
        
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
        
        ValidatorInteger.ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_integer_number';
        return ValidatorInteger;
    })(ValidatorNumber);
    Validator.ValidatorInteger = ValidatorInteger;
    
    var ValidatorDate = (function (_super) {
        __extends(ValidatorDate, _super);
        function ValidatorDate() {
            _super.apply(this, arguments);
        }
        
        ValidatorDate.prototype.validValue = function (value, cb) {
            var res = new Result();
            if (!(value instanceof Date)) {
                res.addError(ValidatorDate.ERROR_VALUE_IS_DATE_OBJECT, [value]);
            }
            cb(null, res);
        };
        
        ValidatorDate.ERROR_VALUE_IS_DATE_OBJECT = 'value_is_not_date_object';
        return ValidatorDate;
    })(ValidatorAbstract);
    Validator.ValidatorDate = ValidatorDate;
})(Validator = exports.Validator || (exports.Validator = {}));

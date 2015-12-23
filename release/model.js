/// <reference path='./../typings/node/node.d.ts' />
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
exports.Result = Result;
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
exports.Model = Model;

/// <reference path='./../typings/node/node.d.ts' />
var validator = require('./validator');
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
        var result = new validator.Result();
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
exports.Property = Property;

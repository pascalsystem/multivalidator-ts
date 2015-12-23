/// <reference path='./../typings/node/node.d.ts' />

import validator = require('./validator');

/**
 * Model schema property validator options
 */
export interface PropertyOptions {
    /**
     * Property validators
     */
    validators?:validator.ValidatorAbstract[];
    /**
     * Allow property value is null
     */
    allowNull?:boolean;
    /**
     * Allow property is undefined
     */
    allowUndefined?:boolean;
    /**
     * Allow property is null or undefined
     */
    allowEmpty?:boolean;
}

/**
 * Schema model
 */
export class Property {
    /**
     * Error code for property not allowed null
     */
    public static ERROR_PROPERTY_NOT_ALLOWED_NULL = 'property_not_allowed_null';
    /**
     * Error code for property not allowed undefined
     */
    public static ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED = 'property_not_allowed_undefined';
    
    /**
     * Validator list
     */
    private validators:validator.ValidatorAbstract[];
    /**
     * Allow null flag
     */
    private allowNull:boolean;
    /**
     * Allow undefined flag
     */
    private allowUndefined:boolean;
    /**
     * Allow null or undefined flag
     */
    private allowEmpty:boolean;

    /**
     * 
     */
    public constructor(options:PropertyOptions) {
        this.validators = (typeof options.validators === 'object') ? options.validators : [];
        this.allowNull = (typeof options.allowNull === 'boolean') ? options.allowNull : false;
        this.allowUndefined = (typeof options.allowUndefined === 'boolean') ? options.allowUndefined : false;
        this.allowEmpty = (typeof options.allowEmpty === 'boolean') ? options.allowEmpty : false;
    }
    
    /**
     * Valid property value
     */
    public valid(value:any, cb:(err:Error, result:validator.Result)=>void) {
        var result:validator.Result = new validator.Result();
        if (value === null) {
            if (!this.allowEmpty && !this.allowNull) {
                result.addError(Property.ERROR_PROPERTY_NOT_ALLOWED_NULL, []);
            }
            cb(null, result);
        } else if (value === undefined) {
            if (!this.allowEmpty && !this.allowUndefined) {
                result.addError(Property.ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED, []);
            }
            cb(null, result);
        } else {
            this.validByValidators(0, value, result, cb);
        }
    }
    
    /**
     * Valid property value by validator
     */
    private validByValidators(idx:number, value:any, result:validator.Result, cb:(err:Error, result:validator.Result)=>void) {
        if (idx < this.validators.length) {
            var self:Property = this;
            this.validators[idx].valid(value, (err:Error, res:validator.Result)=>{
                if (err) {
                    cb(err, null);
                } else {
                    var errs:validator.ResultItem[] = res.getErrors();
                    result.mergeErrors(errs);
                    self.validByValidators(idx + 1, value, result, cb);
                }
            });
        } else {
            cb(null, result);
        }
    }
}
/// <reference path='./../typings/node/node.d.ts' />

export module Model {
    /**
     * Extend validator callback handler function
     */
    export interface ModelExtendValidatorCallbackHandler {
        (err:Error, property:string, result:Validator.Result):void;
    }
    /**
     * Extend validator handler function
     */
    export interface ModelExtendValidator {
        (obj:Object, cb:ModelExtendValidatorCallbackHandler):void;
    }
    /**
     * Model schema property validator options
     */
    export interface ModelOptions {
        /**
         * Properties validator options
         */
        properties:{[key:string]:Property.Property};
        /**
         * Extend validators
         */
        extendValidators?:ModelExtendValidator[];
    }
    /**
     * Validator result
     */
    export class Result {
        /**
         * Validate object properties
         */
        private validateObject:Object;
        /**
         * Property errors
         */
        private properties:{[key:string]:Validator.Result};
        /**
         * 
         */
        public constructor(obj:Object) {
            this.properties = {};
            this.validateObject = null;
        }
        /**
         * Add error code
         */
        public addPropertyResult(property:string, result:Validator.Result) {
            if (this.properties[property]) {
                this.properties[property].mergeErrors(result.getErrors());
            } else {
                this.properties[property] = result;
            }
        }
        /**
         * Get error result items list
         */
        public getPropertyResult(property:string):Validator.Result {
            if (this.properties[property]) {
                return this.properties[property];
            }
            throw new Error('Not found validator result for property: ' + property);
        }
        /**
         * Set validate object property values
         */
        public setValidateObject(obj:Object) {
            this.validateObject = obj;
        }
        /**
         * Get validate object property values
         */
        public getValidateObject():Object {
            if (this.validateObject === null) {
                throw new Error('Result validator model has not defined validate object property values');
            }
            return this.validateObject;
        }
        /**
         * Get valid properties
         */
        public getValidProperties():string[] {
            var properties:string[] = [];
            for (var k in this.properties) {
                if (this.properties[k].isValid()) {
                    properties.push(k);
                }
            }
            return properties;
        }
        /**
         * Get is valid result
         */
        public isValid():boolean {
            for (var k in this.properties) {
                if (!this.properties[k].isValid()) {
                    return false;
                }
            }
            return true;
        }
    }
    /**
     * Model validator
     */
    export class Model {
        /**
         * Properties validators
         */
        private properties:{[key:string]:Property.Property};
        /**
         * Extend model validators
         */
        private extendValidators:ModelExtendValidator[];
        /**
         * 
         */
        public constructor(options:ModelOptions) {
            this.properties = options.properties;
            this.extendValidators = (typeof options.extendValidators === 'object') ? options.extendValidators : [];
        }
        /**
         * Valid object properties
         */
        public valid(obj:Object, cb:(err:Error, result:Result)=>void) {
            if ((typeof obj !== 'object') || !obj) {
                return cb(new Error('Model validator required not null object'), null);
            }
            var self:Model = this;
            var result = new Result(obj);
            var properties:string[] = Object.keys(this.properties);
            this.validByPropertyIdx(0, properties, result, obj, (err:Error)=>{
                if (err) {
                    return cb(err, null);
                }
                self.validByExtendValidatorIdx(0, result, obj, (err:Error)=>{
                    if (err) {
                        return cb(err, null);
                    }
                    self.createValidatePropertyObject(result, obj, cb);
                });
            });
        }
        /**
         * Valid object property by extend validators
         */
        private validByExtendValidatorIdx(idx:number, result:Result, obj:Object, cb:(err:Error)=>void) {
            if (idx < this.extendValidators.length) {
                var self:Model = this;
                this.extendValidators[idx](obj, (err:Error, property:string, resultProperty:Validator.Result)=>{
                    if (err) {
                        cb(err);
                    } else {
                        result.addPropertyResult(property, resultProperty);
                        cb(null);
                    }
                })
            } else {
                cb(null);
            }
        }
        /**
         * Valid object property by properties index
         */
        private validByPropertyIdx(idx:number, properties:string[], result:Result, obj:Object, cb:(err:Error)=>void) {
            if (idx < properties.length) {
                var self:Model = this;
                this.properties[properties[idx]].valid(
                    (typeof obj[properties[idx]] === 'undefined') ? undefined : obj[properties[idx]],
                    (err:Error, propertyResult:Validator.Result)=>{
                        result.addPropertyResult(properties[idx], propertyResult);
                        self.validByPropertyIdx(idx + 1, properties, result, obj, cb);
                    }
                );
            } else {
                cb(null);
            }
        }
        /**
         * Create validate property object values
         */
        private createValidatePropertyObject(result:Result, obj:Object, cb:(err:Error, result:Result)=>void) {
            var properties:string[] = result.getValidProperties();
            var validateProperties:Object = {};
            for (var i=0;i < properties.length;i++) {
                validateProperties[properties[i]] = obj[properties[i]];
            }
            result.setValidateObject(validateProperties);
            cb(null, result);
        }
    }
}

export module Property {
    /**
     * Model schema property validator options
     */
    export interface PropertyOptions {
        /**
         * Property validators
         */
        validators?:Validator.ValidatorAbstract[];
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
        private validators:Validator.ValidatorAbstract[];
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
        public valid(value:any, cb:(err:Error, result:Validator.Result)=>void) {
            var result:Validator.Result = new Validator.Result();
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
        private validByValidators(idx:number, value:any, result:Validator.Result, cb:(err:Error, result:Validator.Result)=>void) {
            if (idx < this.validators.length) {
                var self:Property = this;
                this.validators[idx].valid(value, (err:Error, res:Validator.Result)=>{
                    if (err) {
                        cb(err, null);
                    } else {
                        var errs:Validator.ResultItem[] = res.getErrors();
                        result.mergeErrors(errs);
                        self.validByValidators(idx + 1, value, result, cb);
                    }
                });
            } else {
                cb(null, result);
            }
        }
    }
}

export module Validator {
    /**
     * Result item
     */
    export interface ResultItem {
        /**
         * Error code
         */
        code:string;
        /**
         * Error parameters
         */
        params:any[];
    }
    /**
     * Validator options for abstract validator
     */
    export interface ValidatorOptions {
    }
    /**
     * Validator string options
     */
    export interface ValidatorStringOptions extends ValidatorOptions {
        /**
         * Minimum string length
         */
        minLength:string;
        /**
         * Maximum string length
         */
        maxLength:string;
    }
    /**
     * Validator regular expression options
     */
    export interface ValidatorRegExpOptions extends ValidatorAbstract {
        /**
         * Regular expression
         */
        regExp:RegExp;
        /**
         * Example valid value
         */
        example?:string;
    }
    /**
     * Validator email options
     */
    export interface ValidatorEmailOptions extends ValidatorAbstract {
    }
    /**
     * Validator string options
     */
    export interface ValidatorNumberOptions extends ValidatorOptions {
        /**
         * Minimum number value
         */
        min:number;
        /**
         * Maximum number value
         */
        max:number;
    }
    /**
     * Validator result
     */
    export class Result {
        /**
         * Errors items
         */
        private errors:ResultItem[];
        /**
         * 
         */
        public constructor() {
            this.errors = [];
        }
        /**
         * Add error code
         */
        public addError(code:string, params:any[]) {
            if (!this.hasErrorCode(code)) {
                this.errors.push({
                    code: code,
                    params: params
                });
            }
        }
        /**
         * Merge result items
         */
        public mergeErrors(errors:ResultItem[]) {
            for (var i=0;i < errors.length;i++) {
                if (this.hasErrorCode(errors[i].code)) {
                    continue;
                }
                this.errors.push(errors[i]);
            }
        }
        /**
         * Get error result items list
         */
        public getErrors():ResultItem[] {
            return this.errors;
        }
        /**
         * Get is valid result
         */
        public isValid():boolean {
            return (this.errors.length > 0) ? false : true;
        }
        /**
         * Has error code
         */
        public hasErrorCode(code:string):boolean {
            for (var i=0;i < this.errors.length;i++) {
                if (this.errors[i].code === code) {
                    return true;
                }
            }
            return false;
        }
    }
    /**
     * Validator abstract
     */
    export class ValidatorAbstract {
        /**
         * 
         */
        public constructor(options:ValidatorOptions) {
        }
        /**
         * Valid value
         */
        public valid(value:any, cb:(err:Error, res:Result)=>void) {
            this.validValue(value, cb);
        }
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
            cb(new Error('ValidatorAbstract method validValue is abstract method'), null);
        }
    }
    /**
     * Validator string
     */
    export class ValidatorString extends ValidatorAbstract {
        /**
         * Error code for value is not string
         */
        public static ERROR_VALUE_IS_NOT_STRING = 'value_is_not_string';
        /**
         * Error code for value is to short
         */
        public static ERROR_VALUE_IS_TOO_SHORT = 'value_is_too_short';
        /**
         * Error code for value is to long
         */
        public static ERROR_VALUE_IS_TOO_LONG = 'value_is_too_long';
        /**
         * Minimum string length
         */
        protected minLength:string;
        /**
         * Maximum string length
         */
        protected maxLength:string;
        /**
         * 
         */
        public constructor(options:ValidatorStringOptions) {
            super(options);
            this.minLength = (typeof options.minLength === 'number') ? options.minLength : null;
            this.maxLength = (typeof options.maxLength === 'number') ? options.maxLength : null;
        }
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
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
        }
    }
    /**
     * Validator regular expression string
     */
    export class ValidatorRegExp extends ValidatorAbstract {
        /**
         * Error code for value is not string
         */
        public static ERROR_VALUE_IS_VALID_PATTERN = 'value_is_not_valid_pattern';
        /**
         * Regular expression
         */
        protected regExp:RegExp;
        /**
         * Example valid value
         */
        protected example:string;
        /**
         * 
         */
        public constructor(options:ValidatorRegExpOptions) {
            super(options);
            this.regExp = options.regExp;
            this.example = (typeof options.example === 'string') ? options.example : null;
        }
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
            var res = new Result();
            if ((typeof value !== 'string') || !this.regExp.test(value)) {
                res.addError(ValidatorRegExp.ERROR_VALUE_IS_VALID_PATTERN, [value, this.example]);
            }
            cb(null, res);
        }
    }
    /**
     * Validator email address
     */
    export class ValidatorEmail extends ValidatorAbstract {
        /**
         * Email regular expression
         */
        private static DEFAULT_EMAIL_EXP:RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        /**
         * Error code for value is not string
         */
        public static ERROR_VALUE_IS_NOT_EMAIL = 'value_is_not_email';
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
            var res = new Result();
            if ((typeof value !== 'string') || !ValidatorEmail.DEFAULT_EMAIL_EXP.test(value)) {
                res.addError(ValidatorEmail.ERROR_VALUE_IS_NOT_EMAIL, [value]);
            }
            cb(null, res);
        }
    }
    /**
     * Validator number object type
     */
    export class ValidatorNumber extends ValidatorAbstract {
        /**
         * Error code for value is not number
         */
        public static ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_number';
        /**
         * Error code for value is to less
         */
        public static ERROR_VALUE_IS_TOO_LESS = 'value_is_too_less';
        /**
         * Error code for value is to greater
         */
        public static ERROR_VALUE_IS_TOO_GREATER = 'value_is_too_greater';
        /**
         * Minimum number value
         */
        protected min:number;
        /**
         * Maximum number value
         */
        protected max:number;
        /**
         * 
         */
        public constructor(options:ValidatorNumberOptions) {
            super(options);
            this.min = (typeof options.min === 'number') ? options.min : null;
            this.max = (typeof options.max === 'number') ? options.max : null;
        }
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
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
        }
    }
    /**
     * Validator integer number object type
     */
    export class ValidatorInteger extends ValidatorNumber {
        /**
         * Error code for value is not integer number
         */
        public static ERROR_VALUE_IS_NOT_NUMBER = 'value_is_not_integer_number';
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
            super.validValue(value, (err:Error, res:Result)=>{
                if (err) {
                    return cb(err, null);
                }
                if ((typeof value === 'number') && !value.toString().match(/^(\-)?([0-9]+)$/)) {
                    res.addError(ValidatorInteger.ERROR_VALUE_IS_NOT_NUMBER, [value]);
                }
                cb(null, res);
            });
        }
    }
    /**
     * Validator date object
     */
    export class ValidatorDate extends ValidatorAbstract {
        /**
         * Error code for value is not string
         */
        public static ERROR_VALUE_IS_DATE_OBJECT = 'value_is_not_date_object';
        /**
         * Valid value and get result object
         */
        protected validValue(value:any, cb:(err:Error, res:Result)=>void) {
            var res = new Result();
            if (!(value instanceof Date)) {
                res.addError(ValidatorDate.ERROR_VALUE_IS_DATE_OBJECT, [value]);
            }
            cb(null, res);
        }
    }
}

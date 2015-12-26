/// <reference path='./../typings/node/node.d.ts' />

import validator = require('./validator');
import property = require('./property');

/**
 * Extend validator callback handler function
 */
export interface ModelExtendValidatorCallbackHandler {
    (err:Error, property:string, result:validator.Result):void;
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
    properties:{[key:string]:property.Property};
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
    private properties:{[key:string]:validator.Result};
    
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
    public addPropertyResult(property:string, result:validator.Result) {
        if (this.properties[property]) {
            this.properties[property].mergeErrors(result.getErrors());
        } else {
            this.properties[property] = result;
        }
    }
    
    /**
     * Get error result items list
     */
    public getPropertyResult(property:string):validator.Result {
        if (this.properties[property]) {
            return this.properties[property];
        }
        throw new Error('Not found validator result for property: ' + property);
    }
    
    /**
     * Get object with key is property name and value is property result
     */
    public getPropertiesResult() {
        return this.properties;
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
    private properties:{[key:string]:property.Property};
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
            this.extendValidators[idx](obj, (err:Error, property:string, resultProperty:validator.Result)=>{
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
                (err:Error, propertyResult:validator.Result)=>{
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
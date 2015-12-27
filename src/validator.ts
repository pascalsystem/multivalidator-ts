/// <reference path='./../typings/node/node.d.ts' />

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
    minLength?:number;
    /**
     * Maximum string length
     */
    maxLength?:number;
}

/**
 * Validator regular expression options
 */
export interface ValidatorRegExpOptions extends ValidatorOptions {
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
export interface ValidatorEmailOptions extends ValidatorOptions {
    
}

/**
 * Validator string options
 */
export interface ValidatorNumberOptions extends ValidatorOptions {
    /**
     * Minimum number value
     */
    min?:number;
    /**
     * Maximum number value
     */
    max?:number;
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
    protected minLength:number;
    /**
     * Maximum string length
     */
    protected maxLength:number;
    
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

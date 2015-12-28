declare module "multivalidator-ts" {
    export = MultivalidatorTs;
}

declare module MultivalidatorTs {
    export module Model {
        /**
         * Extend validator callback handler function
         */
        interface ModelExtendValidatorCallbackHandler {
            (err: Error, property: string, result: Validator.Result): void;
        }
        /**
         * Extend validator handler function
         */
        interface ModelExtendValidator {
            (obj: Object, cb: ModelExtendValidatorCallbackHandler): void;
        }
        /**
         * Model schema property validator options
         */
        interface ModelOptions {
            /**
             * Properties validator options
             */
            properties: {
                [key: string]: Property.Property;
            };
            /**
             * Extend validators
             */
            extendValidators?: ModelExtendValidator[];
        }
        /**
         * Validator result
         */
        class Result {
            /**
             * Validate object properties
             */
            private validateObject;
            /**
             * Property errors
             */
            private properties;
            /**
             *
             */
            constructor(obj: Object);
            /**
             * Add error code
             */
            addPropertyResult(property: string, result: Validator.Result): void;
            /**
             * Get error result items list
             */
            getPropertyResult(property: string): Validator.Result;
            /**
             * Get object with key is property name and value is property result
             */
            getPropertiesResult(): {
                [key: string]: Validator.Result;
            };
            /**
             * Set validate object property values
             */
            setValidateObject(obj: Object): void;
            /**
             * Get validate object property values
             */
            getValidateObject(): Object;
            /**
             * Get valid properties
             */
            getValidProperties(): string[];
            /**
             * Get is valid result
             */
            isValid(): boolean;
        }
        /**
         * Model validator
         */
        class Model {
            /**
             * Properties validators
             */
            private properties;
            /**
             * Extend model validators
             */
            private extendValidators;
            /**
             *
             */
            constructor(options: ModelOptions);
            /**
             * Valid object properties
             */
            valid(obj: Object, cb: (err: Error, result: Result) => void): void;
            /**
             * Valid object property by extend validators
             */
            private validByExtendValidatorIdx(idx, result, obj, cb);
            /**
             * Valid object property by properties index
             */
            private validByPropertyIdx(idx, properties, result, obj, cb);
            /**
             * Create validate property object values
             */
            private createValidatePropertyObject(result, obj, cb);
        }
    }
    export module Property {
        /**
         * Model schema property validator options
         */
        interface PropertyOptions {
            /**
             * Property validators
             */
            validators?: Validator.ValidatorAbstract[];
            /**
             * Allow property value is null
             */
            allowNull?: boolean;
            /**
             * Allow property is undefined
             */
            allowUndefined?: boolean;
            /**
             * Allow property is null or undefined
             */
            allowEmpty?: boolean;
        }
        /**
         * Schema model
         */
        class Property {
            /**
             * Error code for property not allowed null
             */
            static ERROR_PROPERTY_NOT_ALLOWED_NULL: string;
            /**
             * Error code for property not allowed undefined
             */
            static ERROR_PROPERTY_NOT_ALLOWED_UNDEFINED: string;
            /**
             * Validator list
             */
            private validators;
            /**
             * Allow null flag
             */
            private allowNull;
            /**
             * Allow undefined flag
             */
            private allowUndefined;
            /**
             * Allow null or undefined flag
             */
            private allowEmpty;
            /**
             *
             */
            constructor(options: PropertyOptions);
            /**
             * Valid property value
             */
            valid(value: any, cb: (err: Error, result: Validator.Result) => void): void;
            /**
             * Valid property value by validator
             */
            private validByValidators(idx, value, result, cb);
        }
    }
    export module Utf8characters {
        var UTF8_CHARACTERS: string;
    }
    export module Validator {
        /**
         * Result item
         */
        interface ResultItem {
            /**
             * Error code
             */
            code: string;
            /**
             * Error parameters
             */
            params: any[];
        }
        /**
         * Validator options for abstract validator
         */
        interface ValidatorOptions {
        }
        /**
         * Validator string options
         */
        interface ValidatorStringOptions extends ValidatorOptions {
            /**
             * Minimum string length
             */
            minLength?: number;
            /**
             * Maximum string length
             */
            maxLength?: number;
        }
        /**
         * Validator clean string options
         */
        interface ValidatorCleanStringOptions extends ValidatorStringOptions {
            /**
             * Allow spacial characters string, default empty string
             */
            allowSpecialChars?: string;
            /**
             * Allow unicode letters (non-ENGLISH characters), default is true
             */
            allowUnicodeChars?: boolean;
            /**
             * Allow number characters, default is true
             */
            allowNumberChars?: boolean;
            /**
             * Allow space characters, default is false
             */
            allowSpace?: boolean;
            /**
             * Allow start with space characters, default is false
             */
            allowStartWithSpace?: boolean;
            /**
             * Allow end with space characters, default is false
             */
            allowEndWithSpace?: boolean;
        }
        /**
         * Validator regular expression options
         */
        interface ValidatorRegExpOptions extends ValidatorOptions {
            /**
             * Regular expression
             */
            regExp: RegExp;
            /**
             * Example valid value
             */
            example?: string;
        }
        /**
         * Validator email options
         */
        interface ValidatorEmailOptions extends ValidatorOptions {
            /**
             * Maximum length email address, default 320
             */
            maxLength?: number;
        }
        /**
         * Validator string options
         */
        interface ValidatorNumberOptions extends ValidatorOptions {
            /**
             * Minimum number value
             */
            min?: number;
            /**
             * Maximum number value
             */
            max?: number;
        }
        /**
         * Validator result
         */
        class Result {
            /**
             * Errors items
             */
            private errors;
            /**
             *
             */
            constructor();
            /**
             * Add error code
             */
            addError(code: string, params: any[]): void;
            /**
             * Merge result items
             */
            mergeErrors(errors: ResultItem[]): void;
            /**
             * Get error result items list
             */
            getErrors(): ResultItem[];
            /**
             * Get is valid result
             */
            isValid(): boolean;
            /**
             * Has error code
             */
            hasErrorCode(code: string): boolean;
        }
        /**
         * Validator abstract
         */
        class ValidatorAbstract {
            /**
             *
             */
            constructor(options: ValidatorOptions);
            /**
             * Valid value
             */
            valid(value: any, cb: (err: Error, res: Result) => void): void;
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator string
         */
        class ValidatorString extends ValidatorAbstract {
            /**
             * Error code for value is not string
             */
            static ERROR_VALUE_IS_NOT_STRING: string;
            /**
             * Error code for value is to short
             */
            static ERROR_VALUE_IS_TOO_SHORT: string;
            /**
             * Error code for value is to long
             */
            static ERROR_VALUE_IS_TOO_LONG: string;
            /**
             * Minimum string length
             */
            protected minLength: number;
            /**
             * Maximum string length
             */
            protected maxLength: number;
            /**
             *
             */
            constructor(options: ValidatorStringOptions);
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator string
         */
        class ValidatorCleanString extends ValidatorString {
            /**
             * Error code for value has not allowed characters
             */
            static ERROR_VALUE_HAS_NOT_ALLOWED_CHARACTERS: string;
            /**
             * Error code value started or ended by empty space characters
             */
            static ERROR_VALUE_START_OR_END_SPACE_CHARACTER: string;
            /**
             * Allow spacial characters string
             */
            protected allowSpecialChars: string;
            /**
             * Allow unicode letters
             */
            protected allowUnicodeChars: boolean;
            /**
             * Allow number characters
             */
            protected allowNumberChars: boolean;
            /**
             * Allow space characters
             */
            protected allowSpace: boolean;
            /**
             * Allow start with space characters
             */
            protected allowStartWithSpace: boolean;
            /**
             * Allow end with space characters
             */
            protected allowEndWithSpace: boolean;
            /**
             * Regular expression match string
             */
            protected matchStr: string;
            /**
             * Regular expression
             */
            protected regExp: RegExp;
            /**
             *
             */
            constructor(options: ValidatorCleanStringOptions);
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator regular expression string
         */
        class ValidatorRegExp extends ValidatorAbstract {
            /**
             * Error code for value is not string
             */
            static ERROR_VALUE_IS_VALID_PATTERN: string;
            /**
             * Regular expression
             */
            protected regExp: RegExp;
            /**
             * Example valid value
             */
            protected example: string;
            /**
             *
             */
            constructor(options: ValidatorRegExpOptions);
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator email address
         */
        class ValidatorEmail extends ValidatorAbstract {
            /**
             * Email regular expression
             */
            private static DEFAULT_EMAIL_EXP;
            /**
             * Default maximum email length
             */
            private static DEFAULT_EMAIL_MAX_LONG;
            /**
             * Error code for value is not string
             */
            static ERROR_VALUE_IS_NOT_EMAIL: string;
            /**
             * Error code for email is too long
             */
            static ERROR_VALUE_EMAIL_TOO_LONG: string;
            /**
             * Maximum email address length
             */
            private maxLength;
            /**
             *
             */
            constructor(options: ValidatorEmailOptions);
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator number object type
         */
        class ValidatorNumber extends ValidatorAbstract {
            /**
             * Error code for value is not number
             */
            static ERROR_VALUE_IS_NOT_NUMBER: string;
            /**
             * Error code for value is to less
             */
            static ERROR_VALUE_IS_TOO_LESS: string;
            /**
             * Error code for value is to greater
             */
            static ERROR_VALUE_IS_TOO_GREATER: string;
            /**
             * Minimum number value
             */
            protected min: number;
            /**
             * Maximum number value
             */
            protected max: number;
            /**
             *
             */
            constructor(options: ValidatorNumberOptions);
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator integer number object type
         */
        class ValidatorInteger extends ValidatorNumber {
            /**
             * Error code for value is not integer number
             */
            static ERROR_VALUE_IS_NOT_NUMBER: string;
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
        /**
         * Validator date object
         */
        class ValidatorDate extends ValidatorAbstract {
            /**
             * Error code for value is not string
             */
            static ERROR_VALUE_IS_DATE_OBJECT: string;
            /**
             * Valid value and get result object
             */
            protected validValue(value: any, cb: (err: Error, res: Result) => void): void;
        }
    }
    
}
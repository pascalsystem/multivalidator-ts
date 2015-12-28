var library = require('./../release/main');
var validator = library.Validator;

var validExpectErrorCode = function(done, value, obj, errorCode, errorParams){
    if (typeof errorParams !== 'object') {
        errorParams = [];
    }
    obj['validValue'](value, function(err, result){
        if (err) {
            done(err);
        } else {
            if (errorCode === null) {
                if (result.isValid()) {
                    done();
                } else {
                    done(new Error('Expect valid result for value: ' + value + ', recive data: ' + JSON.stringify(result.getErrors())));
                }
                return;
            }
            if (result.isValid()) {
                done(new Error('Expect error result for value `' + value + '`'));
            } else {
                var errors = result.getErrors();
                for (var i=0;i < errors.length;i++) {
                    if (errors[i]['code'] === errorCode) {
                        for (var j=0;j < errorParams.length;j++) {
                            if ((errors[i]['params'][j] !== errorParams[j]) && (errorParams[j] !== '__NOT_CHECK_VALUE__')) {
                                return done(new Error('Expect error code: ' + errorCode + ','
                                    + ' but error parameter number: ' + j + ' is invalid'
                                    + ' expect value: ' + errorParams[j]
                                    + ' recive value: ' + errors[i]['params'][j]));
                            }
                        }
                        return done();
                    }
                }
                done(new Error('Expect error result with error item code: ' + errorCode + ' recive data: ' + JSON.stringify(errors)));
            }
        }
    });
};

describe("Result validator", function(){
    it("Create empty result validator and check is valid", function(done){
        var r = new validator.Result();
        if (r.isValid() === true) {
            done();
        } else {
            done(new Error('Expect result validator return true'));
        }
    });
    it("Create result validator with error code but without parameters", function(done){
        var r = new validator.Result();
        r.addError('code', []);
        if (r.isValid() === false) {
            done();
        } else {
            done(new Error('Expect result validator return false'));
        }
    });
    it("Create result validator with error code and parameters", function(done){
        var r = new validator.Result();
        r.addError('code', ['param1', 2]);
        if (r.isValid() === false) {
            done();
        } else {
            done(new Error('Expect result validator return false'));
        }
    });
    it("Create result validator and get error code with parameters list", function(done){
        var r = new validator.Result();
        r.addError('code1', []);
        r.addError('code2', ['param1']);
        var errors = r.getErrors();
        if (typeof errors.length !== 'number') {
            done(new Error('Expect result validator return array list with errors'));
        } else if (errors.length !== 2) {
            done(new Error('Expect result validator return two errors'));
        } else {
            var validCode1 = false;
            var validCode2 = false;
            for (var i=0;i < errors.length;i++) {
                if (
                    (errors[i]['code'] === 'code1') && (typeof errors[i]['params'] === 'object')
                    &&
                    errors[i]['params'] && (Object.keys(errors[i]['params']).length === 0)
                ) {
                    validCode1 = true;
                }
                if (
                    (errors[i]['code'] === 'code2') && (typeof errors[i]['params'] === 'object')
                    &&
                    errors[i]['params'] && (typeof errors[i]['params'][0] === 'string') && (errors[i]['params'][0] === 'param1')
                ) {
                    validCode2 = true;
                }
            }
            if (!validCode1 && !validCode2) {
                done(new Error('Not found in result valid error code1 and code2 with parameters'));
            } else if (!validCode1) {
                done(new Error('Not found in result valid error code1'));
            } else if (!validCode2) {
                done(new Error('Not found in result valid error code2 with parameters'));
            } else {
                done();
            }
        }
    });
    it("Create empty result validator and get empty array list errors", function(done){
        var r = new validator.Result();
        var res = r.getErrors();
        if ((res instanceof Array) && (res.length === 0)) {
            done();
        } else {
            done(new Error('Expect array list with zero elements'));
        }
    });
});

describe("String Validator", function(){
    it("Validate simple string without any options", function(done){
        validExpectErrorCode(done, 'sd', new validator.ValidatorString({}), null);
    });
    it("Validate simple string, but give undefined", function(done){
        validExpectErrorCode(done, undefined, new validator.ValidatorString({}), 'value_is_not_string', [undefined]);
    });
    it("Validate minimum length string -> equal minimum string length", function(done){
        validExpectErrorCode(done, 'sdsdsdsdsd', new validator.ValidatorString({minLength:10}), null);
    });
    it("Validate minimum length string -> equal maximum string length", function(done){
        validExpectErrorCode(done, 'sdsdsdsdsd', new validator.ValidatorString({maxLength:10}), null);
    });
    it("Validate minimum length string -> shorter string length", function(done){
        validExpectErrorCode(done, 'sdsdsdssd', new validator.ValidatorString({minLength:10}), 'value_is_too_short', ['sdsdsdssd', 10]);
    });
    it("Validate minimum length string -> long string length", function(done){
        validExpectErrorCode(done, 'sdsdsdasdasdasdasdssd', new validator.ValidatorString({maxLength:10}), 'value_is_too_long', ['sdsdsdasdasdasdasdssd', 10]);
    });
});

describe("String Clean Validator", function(){
    it("Validate undefined variable", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, undefined, v, 'value_is_not_string', [undefined]);
    });
    it("Validate string only base letters (only-ENGLISH), send valid string", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'sd', v, null);
    });
    it("Validate string only base letters (only-ENGLISH), send string with dot", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'sd.s', v, 'value_has_not_allowed_characters', ['sd.s', '^([A-Za-z]+)$']);
    });
    it("Validate string only base letters (only-ENGLISH), send non eglish letter", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'sdąs', v, 'value_has_not_allowed_characters', ['sdąs', '^([A-Za-z]+)$']);
    });
    it("Validate string only base letters (only-ENGLISH), send number letter", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'sd2s', v, 'value_has_not_allowed_characters', ['sd2s', '^([A-Za-z]+)$']);
    });
    it("Validate string only base letters (only-ENGLISH), send tag character", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'sds>', v, 'value_has_not_allowed_characters', ['sds>', '^([A-Za-z]+)$']);
    });
    it("Validate string with special letters (non-ENGLISH), send valid string without non-ENGLISH letters", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'asd', v, null);
    });
    it("Validate string with special letters (non-ENGLISH), send valid string with non-ENGLISH letters", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'ÄäÖöÜüßasęóąśłżźćńĘÓŁŻŹĆŃŁŚĄd', v, null);
    });
    it("Validate string with special letters (non-ENGLISH), send not valid string with dot", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: false});
        validExpectErrorCode(done, 'ÄäÖöÜüßasęóąśłżźćńĘÓŁŻ.ŹĆŃŁŚĄd', v, 'value_has_not_allowed_characters', ['ÄäÖöÜüßasęóąśłżźćńĘÓŁŻ.ŹĆŃŁŚĄd', '__NOT_CHECK_VALUE__']);
    });
    it("Validate string with special letters (non-ENGLISH) and numbers", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: true});
        validExpectErrorCode(done, 'sdŹĆŃŁŚĄd23', v, null);
    });
    it("Validate string with special letters (non-ENGLISH) and numbers, but send dot", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '', allowNumberChars: true});
        validExpectErrorCode(done, 'sdŹĆŃŁŚĄd23.', v, 'value_has_not_allowed_characters', ['sdŹĆŃŁŚĄd23.', '__NOT_CHECK_VALUE__']);
    });
    it("Validate string base letters and numbers", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: true});
        validExpectErrorCode(done, 'sawe23', v, null);
    });
    it("Validate string base letters and numbers, but send non-ENGLISH letters", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '', allowNumberChars: true});
        validExpectErrorCode(done, 'sdŹĆŃŁŚĄd23.', v, 'value_has_not_allowed_characters', ['sdŹĆŃŁŚĄd23.', '__NOT_CHECK_VALUE__']);
    });
    it("Validate string with special characters string: 3", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '3', allowNumberChars: false});
        validExpectErrorCode(done, 'sdwer3', v, null);
    });
    it("Validate string with special characters string: 3, but send 4", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '3', allowNumberChars: false});
        validExpectErrorCode(done, 'sdwer4', v, 'value_has_not_allowed_characters', ['sdwer4', '^([A-Za-z3]+)$']);
    });
    it("Validate string with special characters string: !@#", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '!@#', allowNumberChars: false});
        validExpectErrorCode(done, 'sdwer!@#', v, null);
    });
    it("Validate string with special characters string: !@#, but send .", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: false, allowSpecialChars: '!@#', allowNumberChars: false});
        validExpectErrorCode(done, '.sdwer!@#', v, 'value_has_not_allowed_characters', ['.sdwer!@#', '^([A-Za-z!@#]+)$']);
    });
    it("Validate string with special character, number, and non-ENGLISH letters", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, 's34łóśdźćżdwer!@#', v, null);
    });
    it("Validate string with special character, number, and non-ENGLISH letters", function(done){
        var v = new validator.ValidatorCleanString({allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, 's34łóśdź.ćżdwer!@#', v, 'value_has_not_allowed_characters', ['s34łóśdź.ćżdwer!@#', '__NOT_CHECK_VALUE__']);
    });
    it("Validate string with special character, number, and non-ENGLISH letters, also allow space inside", function(done){
        var v = new validator.ValidatorCleanString({allowSpace: true, allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, 's34łó śdźćżdwer!@#', v, null);
    });
    it("Validate string with special character, number, and non-ENGLISH letters, also allow space but no first character", function(done){
        var v = new validator.ValidatorCleanString({allowSpace: true, allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, ' s34łóśdźćżdwer!@#', v, 'value_start_or_end_space_characters', [' s34łóśdźćżdwer!@#']);
    });
    it("Validate string with special character, number, and non-ENGLISH letters, also allow space but no last character", function(done){
        var v = new validator.ValidatorCleanString({allowSpace: true, allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, 's34łóśdźćżdwer!@# ', v, 'value_start_or_end_space_characters', ['s34łóśdźćżdwer!@# ']);
    });
    it("Validate string with special character, number, and non-ENGLISH letters, also allow space inside and begining", function(done){
        var v = new validator.ValidatorCleanString({allowStartWithSpace: true, allowSpace: true, allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, ' s34łóśdźćżdwer!@#', v, null);
    });
    it("Validate string with special character, number, and non-ENGLISH letters, also allow space inside and ending", function(done){
        var v = new validator.ValidatorCleanString({allowEndWithSpace:true, allowSpace: true, allowUnicodeChars: true, allowSpecialChars: '!@#', allowNumberChars: true});
        validExpectErrorCode(done, 's34łóśdźćżdwer!@# ', v, null);
    });
});

describe("Number Validator", function(){
    it("Validate number without any options", function(done){
        validExpectErrorCode(done, 2323.23, new validator.ValidatorNumber({}), null);
    });
    it("Validate number, but give undefined", function(done){
        validExpectErrorCode(done, undefined, new validator.ValidatorNumber({}), 'value_is_not_number', [undefined]);
    });
    it("Validate number with minimum value", function(done){
        validExpectErrorCode(done, 11, new validator.ValidatorNumber({min:10}), null);
    });
    it("Validate number with maximum value", function(done){
        validExpectErrorCode(done, 9, new validator.ValidatorNumber({max:10}), null);
    });
    it("Validate minimum number -> equal minimum value", function(done){
        validExpectErrorCode(done, 10, new validator.ValidatorNumber({min:10}), null);
    });
    it("Validate maximum number -> equal maximum value", function(done){
        validExpectErrorCode(done, 10, new validator.ValidatorNumber({max:10}), null);
    });
    it("Validate maximum number -> greater value", function(done){
        validExpectErrorCode(done, 11, new validator.ValidatorNumber({max:10}), 'value_is_too_greater', [11, 10]);
    });
    it("Validate minimum number -> less value", function(done){
        validExpectErrorCode(done, 9, new validator.ValidatorNumber({min:10}), 'value_is_too_less', [9, 10]);
    });
});

describe("Integer Number Validator", function(){
    it("Validate number without any options", function(done){
        validExpectErrorCode(done, 2323, new validator.ValidatorInteger({}), null);
    });
    it("Validate negative number without any options", function(done){
        validExpectErrorCode(done, -2323, new validator.ValidatorInteger({}), null);
    });
    it("Validate not integer number", function(done){
        validExpectErrorCode(done, 2323.23, new validator.ValidatorInteger({}), 'value_is_not_integer_number', [2323.23]);
    });
    it("Validate number, but give undefined", function(done){
        validExpectErrorCode(done, undefined, new validator.ValidatorInteger({}), 'value_is_not_number', [undefined]);
    });
    it("Validate number with minimum value", function(done){
        validExpectErrorCode(done, 11, new validator.ValidatorInteger({min:10}), null);
    });
    it("Validate number with maximum value", function(done){
        validExpectErrorCode(done, 9, new validator.ValidatorInteger({max:10}), null);
    });
    it("Validate minimum number -> equal minimum value", function(done){
        validExpectErrorCode(done, 10, new validator.ValidatorInteger({min:10}), null);
    });
    it("Validate maximum number -> equal maximum value", function(done){
        validExpectErrorCode(done, 10, new validator.ValidatorInteger({max:10}), null);
    });
    it("Validate maximum number -> greater value", function(done){
        validExpectErrorCode(done, 11, new validator.ValidatorInteger({max:10}), 'value_is_too_greater', [11, 10]);
    });
    it("Validate minimum number -> less value", function(done){
        validExpectErrorCode(done, 9, new validator.ValidatorInteger({min:10}), 'value_is_too_less', [9, 10]);
    });
});

describe("Regular Expression Validator", function(){
    it("Validate string text by regular expression", function(done){
        validExpectErrorCode(done, 'abcabcabc', new validator.ValidatorRegExp({regExp:/^([a-z]+)$/}), null);
    });
    it("Validate not valid string text by regular expression without empty example value", function(done){
        validExpectErrorCode(done, 'ASSZD', new validator.ValidatorRegExp({regExp:/^([a-z]+)$/}), 'value_is_not_valid_pattern', ['ASSZD', null]);
    });
    it("Validate not valid string text by regular expression and check example value", function(done){
        validExpectErrorCode(done, 'ASSZD', new validator.ValidatorRegExp({regExp:/^([a-z]+)$/, example:'ASSZD'}), 'value_is_not_valid_pattern', ['ASSZD', 'ASSZD']);
    });
});

describe("Email validator", function(){
    it("Validate email, send valid email adress", function(done){
        validExpectErrorCode(done, 'test@mail.com', new validator.ValidatorEmail({}), null);
    });
    it("Validate email, send email without @", function(done){
        validExpectErrorCode(done, 'testmail.com', new validator.ValidatorEmail({}), 'value_is_not_email', ['testmail.com']);
    });
    it("Validate email, send not valid email", function(done){
        validExpectErrorCode(done, 'test@mail.', new validator.ValidatorEmail({}), 'value_is_not_email', ['test@mail.']);
    });
    it("Validate email, maximum default 320 characters", function(done){
        var longEmailAddress = 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcde@'
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcdes';
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcdes';
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersab.com';
        validExpectErrorCode(done, longEmailAddress, new validator.ValidatorEmail({}), null);
    });
    it("Validate email, too long email for default 320 characters", function(done){
        var longEmailAddress = 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcde@'
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcdes';
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabcdes';
        longEmailAddress+= 'testverylongaddressemail.hasmorethen320characters.hasmorethen320charactersabx.com';
        validExpectErrorCode(done, longEmailAddress, new validator.ValidatorEmail({}), 'value_email_too_long', [longEmailAddress, 320]);
    });
    it("Validate email, valid email by custom long characters equal 30", function(done){
        var longEmailAddress = 'shortestthen30@shortes.com';
        validExpectErrorCode(done, longEmailAddress, new validator.ValidatorEmail({maxLength:30}), null);
    });
    it("Validate email, too long email by custom long characters equal 30", function(done){
        var longEmailAddress = 'longestemailaddressmore30@shortes.com';
        validExpectErrorCode(done, longEmailAddress, new validator.ValidatorEmail({maxLength:30}), 'value_email_too_long', [longEmailAddress, 30]);
    });
});

describe("Date object validator", function(){
    it("Validate date object, send date object", function(done){
        validExpectErrorCode(done, new Date(), new validator.ValidatorDate({}), null);
    });
    it("Validate date object, send number object", function(done){
        validExpectErrorCode(done, 23, new validator.ValidatorDate({}), 'value_is_not_date_object', [23]);
    });
    it("Validate date object, send undefined", function(done){
        validExpectErrorCode(done, undefined, new validator.ValidatorDate({}), 'value_is_not_date_object', [undefined]);
    });
    it("Validate date object, send null", function(done){
        validExpectErrorCode(done, null, new validator.ValidatorDate({}), 'value_is_not_date_object', [null]);
    });
});
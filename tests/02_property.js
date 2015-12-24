var library = require('./../release/main');
var property = library.Property;
var validator = library.Validator;

var testPropertyValid = function(done, value, obj, errorCode) {
    obj['valid'](value, function(err, result){
        if (err) {
            done(err);
        } else {
            if (errorCode !== null) {
                if (result.isValid()) {
                    done(new Error('Expect error code: ' + errorCode + ', get valid result'));
                } else {
                    var errors = result.getErrors();
                    for (var i=0;i < errors.length; i++) {
                        if (errors[i]['code'] === errorCode) {
                            return done();
                        }
                    }
                    done(new Error('Expect error code: ' + errorCode + ', get another errors: ' + JSON.stringify(errors)));
                }
            } else {
                if (result.isValid()) {
                    done();
                } else {
                    done(new Error('Expect valid result, get error messages: ' + JSON.stringify(result.getErrors())));
                }
            }
        }
    });
};

describe("Property validator check allow null/undefined/empty", function(){
    it("Create property without any validator and without any allow options and send undefined", function(done){
        testPropertyValid(done, undefined, new property.Property({}), 'property_not_allowed_undefined');
    });
    it("Create property without any validator and without any allow options and send null", function(done){
        testPropertyValid(done, null, new property.Property({}), 'property_not_allowed_null');
    });
    it("Create property without any validator and without any allow options and send number", function(done){
        testPropertyValid(done, 23, new property.Property({}), null);
    });
    it("Create property without any validator and without any allow options and send string", function(done){
        testPropertyValid(done, 'asdasd', new property.Property({}), null);
    });
    it("Create property without any validator and without any allow options and send date object", function(done){
        testPropertyValid(done, new Date(), new property.Property({}), null);
    });
    it("Create property allowed null value and send null value", function(done){
        testPropertyValid(done, null, new property.Property({allowNull:true}), null);
    });
    it("Create property allowed null value and send number value", function(done){
        testPropertyValid(done, 2323, new property.Property({allowNull:true}), null);
    });
    it("Create property allowed null value and send undefined", function(done){
        testPropertyValid(done, undefined, new property.Property({allowNull:true}), 'property_not_allowed_undefined');
    });
    it("Create property allowed undefined value and send null undefined", function(done){
        testPropertyValid(done, undefined, new property.Property({allowUndefined:true}), null);
    });
    it("Create property allowed undefined value and send number value", function(done){
        testPropertyValid(done, 2323, new property.Property({allowUndefined:true}), null);
    });
    it("Create property allowed undefined value and send null", function(done){
        testPropertyValid(done, null, new property.Property({allowUndefined:true}), 'property_not_allowed_null');
    });
    it("Create property allowed empty value and send null", function(done){
        testPropertyValid(done, null, new property.Property({allowEmpty:true}), null);
    });
    it("Create property allowed empty value and send undefined", function(done){
        testPropertyValid(done, undefined, new property.Property({allowEmpty:true}), null);
    });
    it("Create property allowed empty value and send number value", function(done){
        testPropertyValid(done, 233, new property.Property({allowEmpty:true}), null);
    });
});

describe("Property validator with validators and allow null", function(){
    var v = new property.Property({allowNull:true, validators:[new validator.ValidatorNumber({max:30}), new validator.ValidatorNumber({min:10})]});
    it("Send null value", function(done){
        testPropertyValid(done, null, v, null);
    });
    it("Send undefined value", function(done){
        testPropertyValid(done, undefined, v, 'property_not_allowed_undefined');
    });
    it("Send number value which is validate", function(done){
        testPropertyValid(done, 16, v, null);
    });
    it("Send number value which is not validate by second validator", function(done){
        testPropertyValid(done, 6, v, 'value_is_too_less');
    });
    it("Send number value which is not validate by first validator", function(done){
        testPropertyValid(done, 33, v, 'value_is_too_greater');
    });
});
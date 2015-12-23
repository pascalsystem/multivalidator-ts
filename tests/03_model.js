var model = require('./../release/model');
var property = require('./../release/property');
var validator = require('./../release/validator');

describe("Validate model by validator", function(){
    var m1 = new model.Model({
        properties:{
            prop1: new property.Property({validators:[new validator.ValidatorNumber({})]}),
            prop2: new property.Property({allowNull:true, validators:[new validator.ValidatorNumber({})]})
        }
    });
    var m2 = new model.Model({
        properties:{
            prop1: new property.Property({validators:[new validator.ValidatorNumber({})]}),
            prop2: new property.Property({allowNull:true, validators:[new validator.ValidatorNumber({})]})
        },
        extendValidators: [
            function(obj, cb) {
                var res = new validator.Result();
                if (obj['prop2'] === null) {
                    res.addError('expect_not_null_result_prop2', []);
                }
                cb(null, 'prop2', res);
            }
        ]
    });

    it("Send object validate property values", function(done){
        m1.valid({prop1:1, prop2:2}, function(err, result){
            if (err) {
                done(err);
            } else if (result.isValid()) {
                done();
            } else {
                done(new Error('Expect validate result, but get result: ' + JSON.stringify(result)));
            }
        });
    });
    it("Send object with not validate one property", function(done){
        m1.valid({prop1:2, prop2:'ss'}, function(err, result){
            if (err) {
                done(err);
            } else if (result.isValid()) {
                done(new Error('Expect not validate result for property prop2'));
            } else if (
                result.getPropertyResult('prop1').isValid()
                &&
                !result.getPropertyResult('prop2').isValid()
            ) {
                done();
            } else {
                done(new Error('Expect valid result for prop1 but not valid for prop2'));
            }
        });
    });
    it("Send object with not validate one property and chec is not valid", function(done){
        m1.valid({prop1:null, prop2:null}, function(err, result){
            if (err) {
                done(err);
            } else if (!result.isValid()) {
                done();
            } else {
                done(new Error('Expect not valid result'));
            }
        });
    });
    it("Check property model error code", function(done){
        m1.valid({prop1:23, prop2:'s'}, function(err, result){
            if (err) {
                done(err);
            } else if (result.isValid()) {
                done(new Error('Expect error result, but get valid result'));
            } else {
                var errs = result.getPropertyResult('prop2').getErrors();
                for (var i=0;i < errs.length;i++) {
                    if (errs[i]['code'] === 'value_is_not_number') {
                        return done();
                    }
                }
                done(new Error('Expect error code value_is_not_number for prop2 in object'));
            }
        });
    });    
    it("Get error for property by extend validator", function(done){
        m2.valid({prop1: 2, prop2: null}, function(err, result){
            if (err) {
                done(err);
            } else if (result.isValid()) {
                done(new Error('Expect error result'));
            } else if (!result.getPropertyResult('prop1').isValid()) {
                done(new Error('Expect valid result for prop1 property'));
            } else {
                var errs = result.getPropertyResult('prop2').getErrors();
                for (var i=0;i < errs.length;i++) {
                    if (errs[i]['code'] === 'expect_not_null_result_prop2') {
                        return done();
                    }
                }
                done(new Error('Expect error code expect_not_null_result_prop2 for prop2 value'));
            }
        });
    });
});

describe("Validate model and get validate properties values", function(){
    var m = new model.Model({
        properties:{
            prop1: new property.Property({validators:[new validator.ValidatorNumber({})]}),
            prop2: new property.Property({allowNull:true, validators:[new validator.ValidatorNumber({})]})
        }
    });
    
    it("Get validate values for validate object", function(done){
        m.valid({prop1:2, prop2:4}, function(err, result){
            if (err) {
                done(err);
            } else {
                var o = result.getValidateObject();
                if ((Object.keys(o).length === 2) && (o['prop1'] === 2) && (o['prop2'] === 4)) {
                    done();
                } else {
                    done(new Error('Expect validate object get prop1 and prop2 values'));
                }
            }
        });
    });
    it("Get validate values for only one property prop1", function(done){
        m.valid({prop1:4, prop2:'s'}, function(err, result){
            if (err) {
                done(err);
            } else {
                var o = result.getValidateObject();
                if ((Object.keys(o).length === 1) && (o['prop1'] === 4)) {
                    done();
                } else {
                    done(new Error('Expect validate object get only prop1 equal 4'));
                }
            }
        });
    });
})
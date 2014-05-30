var assert = require('assert');

var fastsync = require('../fastsync');
testSuite("fastsync");

var fastsync = require("../fastsync.min");
testSuite("fastsync.min");

function testSuite(testName){
    describe(testName, function(){
        describe("#parallel", function(){
            it('should do functions in parallel', function(done){
                var inflightCount = 0;
                var wait100 = function(cb) {
                    inflightCount++;
                    setTimeout(cb, 100);
                };
                fastsync.parallel([
                    wait100,
                    wait100,
                    wait100,
                    wait100,
                    wait100
                ], function(err, results){
                    assert.equal(inflightCount, 5);
                    done();
                });
            });

            it('should do functions in parallel and return values in order', function(done){
                var wait100 = function(i, cb) {
                    setTimeout(function(){
                        cb(null, i);
                    }, 100);
                };
                var startTime = new Date().getTime();
                fastsync.parallel([
                    wait100.bind(null, 1),
                    wait100.bind(null, 2),
                    wait100.bind(null, 3),
                    wait100.bind(null, 4),
                    wait100.bind(null, 5)
                ], function(err, results){
                    assert.deepEqual(results, [1,2,3,4,5]);
                    done();
                });
            });

            it('should do functions in parallel and return error and values in order', function(done){
                var anError = "An Error";
                var wait100AndReturnErrOn3 = function(i, cb) {
                    setTimeout(function(){
                        if (i == 3) {
                            cb(anError);
                        } else {
                            cb(null, i);
                        }
                    }, 100);
                };
                var startTime = new Date().getTime();
                fastsync.parallel([
                    wait100AndReturnErrOn3.bind(null, 0),
                    wait100AndReturnErrOn3.bind(null, 1),
                    wait100AndReturnErrOn3.bind(null, 2),
                    wait100AndReturnErrOn3.bind(null, 3),
                    wait100AndReturnErrOn3.bind(null, 4)
                ], function(error, results){
                    assert.equal(error, anError);
                    done();
                });
            });
        });

        describe("#series", function(){
            it('should do functions in series and return values in order', function(done){
                var current = 1;
                var wait100 = function(i, cb) {
                    setTimeout(function(){
                        //verify that we're calling our function
                        //in the order we expect by comparing i to a counter
                        assert.equal(i, current);
                        current++;
                        cb(null, i);
                    }, 10);
                };
                var startTime = new Date().getTime();
                fastsync.series([
                    wait100.bind(null, 1),
                    wait100.bind(null, 2),
                    wait100.bind(null, 3),
                    wait100.bind(null, 4),
                    wait100.bind(null, 5)
                ], function(err, results){
                    assert.deepEqual(results, [1,2,3,4,5]);
                    done();
                });
            });
        });

        describe("#waterfall", function(){
            it('should execute a waterfall and finish', function(done){
                fastsync.waterfall([
                    function one(cb){
                        setTimeout(function(){
                            cb(null, 8);
                        }, 10);
                    },
                    function split(num, cb) {
                        setTimeout(function(){
                            cb(null, num / 4, num / 4);
                        }, 10);
                    },
                    function add(a, b, cb) {
                        setTimeout(function(){
                            cb(null, a + b);
                        }, 10);
                    },
                    function duplicatePlus1(num, cb) {
                        setTimeout(function(){
                            cb(null, num, num + 1);
                        }, 10);
                    }
                ], function(err, result1, result2){
                    assert.equal(result1, 4);
                    assert.equal(result2, 5);
                    assert.ok(!err);
                    done();
                });
            });

            it('should execute a waterfall and throw error', function(done){
                fastsync.waterfall([
                    function one(cb){
                        setTimeout(function(){
                            cb(null, 8);
                        }, 10);
                    },
                    function split(num, cb) {
                        setTimeout(function(){
                            cb(null, num / 4, num / 4);
                        }, 10);
                    },
                    function add(a, b, cb) {
                        setTimeout(function(){
                            cb("ERROR");
                        }, 10);
                    },
                    function duplicatePlus1(num, cb) {
                        setTimeout(function(){
                            cb("ERROR2");
                        }, 10);
                    }
                ], function(err, result1, result2){
                    assert.ok(err == "ERROR");
                    done();
                });
            });
        });

        describe("#asyncMap", function(){
            it("should map asynchronously", function(done){
                fastsync.asyncMap([1,2,3], function(val, cb){
                    setTimeout(function(){
                        cb(null, val * 2);
                    }, 10);
                }, function(err, mappedResult) {
                    assert.deepEqual(mappedResult, [2,4,6]);
                    done();
                });
            });

            it("should fail on error", function(done){
                var anError = "An Error";
                var wait100AndReturnErrOn3 = function(val, cb) {
                    setTimeout(function(){
                        if (val == 3) {
                            cb(anError);
                        } else {
                            cb(null, val);
                        }
                    }, 100);
                };
                fastsync.asyncMap([1,2,3,4,5,6], wait100AndReturnErrOn3, function(err, mappedResult) {
                    assert.equal(err, anError);
                    done();
                });
            });
        });
    });
}

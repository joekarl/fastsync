

(function(exports){

    /**
     * Simple parallelize function
     * Assumes fns array has function(err, callback) items and no nulls
     * This is naive, but no error checking == fast
     *
     * cb should be a function(err, results[])
     * where results will be an array containing the results of the fn call
     */
    exports.parallel = function(fns, cb) {
        var fnsLength = fns.length,
            i = 0,
            countingCallback = makeCountNCallback(fnsLength, cb);
        for (i; i < fnsLength; ++i) {
            fns[i](makeIndexedCallback(i, countingCallback));
        }
    };

    /**
     * Simple serialize function
     * Assumes fns array has function(err, callback) items and no nulls
     * This is naive, but no error checking == fast
     *
     * cb should be a function(err, results[])
     * where results will be an array containing the results of the fn call
     */
    exports.serial = function(fns, cb) {
        var fnsLength = fns.length,
            i = 0,
            results = [];
        fns[i](makeChainedCallback(i, fns, results, cb));
    };

    /**
     * Simple waterfall function
     * Assumes fns array has function(args..., callback) items and no nulls
     *
     * cb should be a function(err, args...)
     * where error is an error that occured
     * and args is the expected results of the waterfall
     *
     * example:
     * simpleAsync.waterfall([
     *     function one(cb){
     *         setTimeout(function(){
     *             cb(null, 8);
     *         }, 10);
     *     },
     *     function split(num, cb) {
     *         setTimeout(function(){
     *             cb(null, num / 4, num / 4);
     *         }, 10);
     *     },
     *     function add(a, b, cb) {
     *         setTimeout(function(){
     *             cb(null, a + b);
     *         }, 10);
     *     },
     *     function duplicatePlus1(num, cb) {
     *         setTimeout(function(){
     *             cb(null, num, num + 1);
     *         }, 10);
     *     }
     * ], function(err, result1, result2){
     *     assert.equal(result1, 4);
     *     assert.equal(result2, 5);
     *     assert.ok(err == null);
     * });
     */
    exports.waterfall = function(fns, cb) {
        var fnsLength = fns.length,
            i = 0;
        fns[i](makeChainedWaterfallCallback(i, fns, cb));
    };

    /**
     * Asynchronously map an array across a function
     * and call callback when finished or error
     *
     * cb should be a function(err, mappedArray)
     */
    exports.asyncMap = function(arr, fn, cb) {
        var pipeline = [],
            i = 0;
        for (i; i < arr.length; ++i) {
            pipeline[i] = fn.bind(null, arr[i]);
        }
        exports.parallel(pipeline, cb);
    };

    /**
     * Create a function that will call the next function in a chain
     * with the results of the original function
     * until the chain is finished
     */
    function makeChainedWaterfallCallback(i, fns, cb) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            if (args[0]) {
                //ie. we had an error
                return cb(args[0]);
            }
            if (fns[i + 1]) {
                //remove error arg
                args.shift();
                args.push(makeChainedWaterfallCallback(i + 1, fns, cb));
                return fns[i + 1].apply(null, args);
            } else {
                return cb.apply(null, args);
            }
        };
    }

    /**
     * Create a function that will call the next function in a chain
     * when finished
     */
    function makeChainedCallback(i, fns, results, cb) {
        return function(err, result) {
            if (err) {
                return cb(err);
            }
            results[i] = result;
            if (fns[i + 1]) {
                return fns[i + 1](makeChainedCallback(i + 1, fns, results, cb));
            } else {
                return cb(null, results);
            }
        };
    }

    /**
     * Create a function that will call a callback after n function calls
     */
    function makeCountNCallback(n, cb) {
        var count = 0,
            results = [],
            error;
        return function(index, err, result) {
            results[index] = result;
            if (!error && err) {
                error = err;
                return cb(err);
            }
            if (!error && ++count == n) {
                cb(null, results);
            }
        };
    }

    /**
     * Create a function that will call a callback with a specified index
     */
    function makeIndexedCallback(i, cb) {
        return function(err, result) {
            cb(i, err, result);
        };
    }

})(typeof exports === 'undefined' ? this.fastsync = this.fastsync || {} : exports);

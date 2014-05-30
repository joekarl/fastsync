fastsync
========

Simple flow control library with no dependencies and streamlined to be small and fast.
Designed in the same lineage as caolan's async/nimble libraries (ie this is NOT
a promise library).

Works in the browser or in node.js. Minified it is 830 bytes.

`npm install fastsync`

Covers 4 basic use cases:

* parallel - Run functions in parallel and callback when finished
* series - Run functions in series and callback when finished
* waterfall - Run functions in series while passing results of one function to the next
* asyncMap - Convenience method for mapping an array using asynchronous functions, analogous to an async version of Array.forEach

##Examples
####parallel

    fastsync.parallel([
        function one(cb) {
            setTimeout(function(){
                cb(null, 1);
            }, 100);
        },
        function two(cb) {
            setTimeout(function(){
                cb(null, 2);
            }, 100);
        },
        function three(cb) {
            setTimeout(function(){
                cb(null, 3);
            }, 100);
        },
        function four(cb) {
            setTimeout(function(){
                cb(null, 4);
            }, 100);
        }
    ], function(err, results){
        //100ms later
        console.log(results); //[1, 2, 3, 4]
    });

####series

    fastsync.series([
        function one(cb) {
            setTimeout(function(){
                cb(null, 1);
            }, 100);
        },
        function two(cb) {
            setTimeout(function(){
                cb(null, 2);
            }, 100);
        },
        function three(cb) {
            setTimeout(function(){
                cb(null, 3);
            }, 100);
        },
        function four(cb) {
            setTimeout(function(){
                cb(null, 4);
            }, 100);
        }
    ], function(err, results){
        //400ms later
        console.log(results); //[1, 2, 3, 4]
    });

####waterfall

    fastsync.waterfall([
        function(cb) {
            cb(null, 8);
        },
        function split(v, cb) {
            //v = 8
            cb(null, v / 2, v / 2);
        },
        function square(v1, v2, cb) {
            //v1 = 4, v2 = 4
            cb(null, v1 * v2);
        },
        function minus1(v, cb) {
            //v = 16
            cb(null, v - 1);
        }
    ], function(err, result){
        console.log(result); //15
    });

####asyncMap

    fastsync.asyncMap([1,2,3], function mult5(v, cb){
        setTimeout(function(){
            cb(null, v * 5);
        }, 100);
    }, function(err, mappedArray){
        console.log(mappedArray); //[5,10,15]
    });

##Tests
Browser tests can be run by opening test/test.html in your browser.

Node tests can be run with `npm test`.

Both the full size and minified version are tested.

##Benchmarks
Fastsync performs much better than the caolan's original async library and
outperforms every promise lib except for bluebird when using node 0.11.13 (though
in all fairness fastsync it doesn't try to do as much.)

Copy of the https://github.com/petkaantonov/bluebird benchmarks.

To run a benchmark, run the given command for a benchmark while on the project root.

Node 0.11.13+ is required to run the generator examples.

###DoxBee sequential

Currently the most relevant benchmark is @gorkikosev's benchmark in the article
[Analysis of generators and other async patterns in node](http://spion.github.io/posts/analysis-generators-and-other-async-patterns-node.html).
The benchmark emulates a situation where n amount of users are making a request in parallel
to execute some mixed async/sync action. The benchmark has been modified to include a warm-up
phase to minimize any JITing during timed sections.

Command: `benchmark/bench doxbee`

####Results (node 0.10.26)

    results for 10000 parallel executions, 1 ms per I/O op

    file                                     time(ms)  memory(MB)
    callbacks-baseline.js                         196       35.29
    callbacks-joekarl-fastsync-waterfall.js       307       48.75
    promises-bluebird.js                          340       52.65
    promises-cujojs-when.js                       741      111.94
    promises-lvivski-davy.js                      753       49.84
    promises-dfilatov-vow.js                      872       87.07
    promises-calvinmetcalf-lie.js                 991       57.23
    callbacks-caolan-async-waterfall.js           992       58.40
    promises-obvious-kew.js                      1196      107.42
    promises-tildeio-rsvp.js                     1966       83.47
    promises-medikoo-deferred.js                 3158      180.11
    promises-then-promise.js                     3610      184.30
    promises-kriskowal-q.js                     14378      434.06
    promises-bluebird-generator.js                OOM         OOM
    promises-ecmascript6-native.js                OOM         OOM

    Platform info:
    Darwin 13.2.0 x64
    Node.JS 0.10.26
    V8 3.14.5.9
    Intel(R) Core(TM) i7-3615QM CPU @ 2.30GHz × 8

####Results (node 0.11.13)

    results for 10000 parallel executions, 1 ms per I/O op

    file                                     time(ms)  memory(MB)
    callbacks-baseline.js                         305       38.64
    promises-bluebird-generator.js                332       32.66
    promises-bluebird.js                          401       51.83
    callbacks-joekarl-fastsync-waterfall.js       451       51.26
    callbacks-caolan-async-waterfall.js           805       91.33
    promises-cujojs-when.js                       925      108.32
    promises-dfilatov-vow.js                      988      153.09
    promises-lvivski-davy.js                     1023       86.84
    promises-calvinmetcalf-lie.js                1246      134.00
    promises-obvious-kew.js                      1524      160.73
    promises-ecmascript6-native.js               1634      194.23
    promises-tildeio-rsvp.js                     1654      221.68
    promises-then-promise.js                     2039      256.64
    promises-medikoo-deferred.js                 3342      289.68
    promises-kriskowal-q.js                     20554      550.43
    callbacks-caolan-nimble-waterfall.js          OOM         OOM

    Platform info:
    Darwin 13.2.0 x64
    Node.JS 0.11.13
    V8 3.25.30
    Intel(R) Core(TM) i7-3615QM CPU @ 2.30GHz × 8

###Made-up parallel

This made-up scenario runs 15 shimmed queries in parallel.

Command: `benchmark/bench parallel`

####Results (node 0.10.26)

    results for 10000 parallel executions, 1 ms per I/O op

    file                                    time(ms)  memory(MB)
    callbacks-baseline.js                        299       49.45
    callbacks-joekarl-fastsync-parallel.js       553       86.48
    promises-bluebird.js                         664       93.29
    callbacks-caolan-nimble-parallel.js         1111      105.54
    promises-lvivski-davy.js                    1558      202.39
    callbacks-caolan-async-parallel.js          1721      188.44
    promises-cujojs-when.js                     2143      228.69
    promises-calvinmetcalf-lie.js               2200      354.08
    promises-dfilatov-vow.js                    2439      398.06
    promises-obvious-kew.js                     4888      796.65
    promises-medikoo-deferred.js                6922      679.69
    promises-tildeio-rsvp.js                    8174      666.74
    promises-then-promise.js                   14823      663.83
    promises-ecmascript6-native.js               OOM         OOM
    promises-bluebird-generator.js               OOM         OOM

    Platform info:
    Darwin 13.2.0 x64
    Node.JS 0.10.26
    V8 3.14.5.9
    Intel(R) Core(TM) i7-3615QM CPU @ 2.30GHz × 8

####Results (node 0.11.13)

    results for 10000 parallel executions, 1 ms per I/O op

    file                                    time(ms)  memory(MB)
    callbacks-baseline.js                        487       45.58
    promises-bluebird.js                         767      122.02
    callbacks-joekarl-fastsync-parallel.js       950       91.91
    promises-bluebird-generator.js              1000      127.07
    promises-lvivski-davy.js                    1583      255.25
    callbacks-caolan-nimble-parallel.js         1707      116.01
    promises-calvinmetcalf-lie.js               1814      370.79
    promises-cujojs-when.js                     2002      281.67
    promises-dfilatov-vow.js                    2374      344.61
    callbacks-caolan-async-parallel.js          2999      193.40
    promises-tildeio-rsvp.js                    4667      984.70
    promises-obvious-kew.js                     5163      495.92
    promises-then-promise.js                    5276      669.26
    promises-ecmascript6-native.js              6195      530.49
    promises-medikoo-deferred.js                6812      699.08

    Platform info:
    Darwin 13.2.0 x64
    Node.JS 0.11.13
    V8 3.25.30
    Intel(R) Core(TM) i7-3615QM CPU @ 2.30GHz × 8

##Gulp tasks

* lint - run jshint on fastsync.js
* build - build minified version of fastsync

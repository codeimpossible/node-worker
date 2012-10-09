require('./test_helpers');
describe('Integration', function(){
  var assert      = require("assert");
  var FakeHttp    = require('./stub_http_request');

  var JobCreator, Worker, worker;

  beforeEach(function() {
    JobCreator  = require('../src/job_creator');
    Worker      = require('../src/worker');

    // load the stub jobs
    require('./stub_jobs');

    worker      = Worker.create({
      fs: {
        exists: function(file, ev) { ev(true); },
        readFile: function(file, type, ev) { ev(null, "worker_id: testWorker"); }
      },
      http: new FakeHttp({ Data: { Job: { type: "MathJob", number: 100 } } }).allow(1)
    });
  });

  describe('worker', function(){
    it('should get and run first job on init', function( done ){
      done.after(1000, 'MathJob didnt increment the number by 100' );

      worker.on('finish_job', function(data){
        done.prevent();
        done();
        assert.equal(200, data.result);
      });

      worker.init();
    });
  });

  describe('when a worker completes a job', function( ){
    describe('the worker', function(){
      it('should ask proggr web api for the next job', function( done ){
        // configure the worker so that our asserts get called on the subsequent calls to http.request
        var count = 0;
        var http = new FakeHttp({ Data: { Job: { type: "MathJob", number: 100 } } }).allow(2);

        http.httpResponse().on('data', function( chunk ) {
          ++count;
          if( count > 1 ) {
            done.prevent();
            done();
            assert.equal(2, count);
          }
        });

        worker = Worker.create({
          fs: {
            exists: function(file, ev) { ev(true); },
            readFile: function(file, type, ev) { ev(null, "worker_id: testWorker"); }
          },
          http: http
        });

        done.after(1000, 'Worker did not attempt to find more work!' );

        worker.init();
      });
    });
  });
});

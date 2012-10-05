require('./test_helpers');
describe('Integration', function(){
  var assert      = require("assert");

  var JobCreator, Worker, worker;

  beforeEach(function() {
    JobCreator  = require('../src/job_creator');
    Worker      = require('../src/worker');

    // load the stub jobs
    require('./stub_jobs');

    worker      = Worker.create({
      fs: {
        exists: function(file, ev) { ev(true); },
        readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
      },
      http: {
        request: function(options, fn) {
          // fn is a callback, send a fake json response back
          var json = { type: "MathJob", number: 100 };
          fn(json);
          this.request = function() {}; // prevent subsequent calls from getting a response
        }
      }
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
});

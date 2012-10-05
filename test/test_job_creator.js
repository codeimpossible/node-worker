require('./test_helpers');
describe('JobCreator', function(){
  var assert      = require("assert");

  var JobCreator;

  beforeEach(function() {
    JobCreator = require('../src/job_creator');
  });

  describe('#create', function(){
    it('should exist', function(){
      assert.ok(JobCreator.create)
    })

    it('should return EmptyJob if job_package#type is not recognized', function(){
      var job = JobCreator.create({
        type: "IMadeThisUp"
      });

      assert.equal('EmptyJob', job.type);
    })
  });
});

describe('Job', function(){
  var assert      = require("assert");

  var job, JobCreator;

  beforeEach(function() {
    JobCreator = require('../src/job_creator');
  });

  describe('#run', function(){
    it('should call Worker#finish_job after work is done', function( done ){
      var worker = {
        finish_job: function(){
          done.prevent();
          done();
        }
      }

      done.after(1000, 'Worker#finish_job was not called when the job completed!');

      job = JobCreator.create({}); // empty job
      job.run(worker);
    })
  })
});

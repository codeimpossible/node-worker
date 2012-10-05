var JobCreator = require('../src/job_creator');

JobCreator.add_job("MathJob", function( job_obj ){
  job_obj.data.result = 100 + job_obj.data.number;
});

/*
  Proggr nodejs job creator
  (c) 2012 proggr
  (a) Jared Barboza <codeimpossible@gmail.com>

  the job creator creates concrete objects that perform work for workers.
*/

var job_factory = {};

var Job = function(data, fn) {
  return {
    type: data.type, // shortcut
    data: data,
    run: function(worker){
      fn(this);
      worker.finish_job(this);
    }
  };
}

var EmptyJob = (function() {
  job_factory["EmptyJob"] = function(){
    return 0;
  };

  return job_factory["EmptyJob"];
})();

var JobCreator = function() {
  // private methods

  return {
    add_job: function( type, fn ) {
      job_factory[type] = fn;
    },
    create: function(job_json) {
      // do we know this type?
      var job_fn = job_factory[job_json.type];
      if( job_fn ) {
        return Job(job_json, job_fn);
      }
      return Job( { type: "EmptyJob" }, job_factory["EmptyJob"] );
    }
  }
};

module.exports = JobCreator();

/*
  Proggr node-js worker
  (c) 2012 proggr
  (a) Jared Barboza <codeimpossible@gmail.com>


  workers are the heavy lifters of the proggr organization. They
  perform all the tasks that make proggr valuable.

  SlocRepo            -   download each new commit since the repo was last sloc'd.
                          store the commit deltas (lines added, lines removed) in the db
                          Info Needed:
                            * Repo Name and Owner at Github
                            * Last commit SHA

  SyncUserRepos       -   verify the list of "projects" in proggr against the list of
                          "repos" in github. remove any that do not exist in github. add
                          any that do not exist in proggr.
                          Info Needed:
                            * Github Username
                            * (eventually) Github OAuth Token (will need HTTPS for this)

  AwardAchievements   -   the bread and butter of proggr. count the LOC for each recent commit
                          and repo and award achievements accordingly.
                          Info Needed:
                            * Proggr Userid
                            *


  When a worker first starts it will expect a worker.yml file to exist in the same directory
  as the worker node app. This file should contain the user_id and the secret token for a valid
  proggr user. Workers _must_ be associated with a user account before they can start doing work.

  The worker will then send a startup signal to proggr. This will create the entry in the Workers
  table for this worker and link the worker to the user account. The response for this request will
  return the workers first job.

  After each job the worker will ask for its next task. Eventually users may be able to configure
  the worker to only accept certain tasks but for MVP the worker will do whatever comes next.
*/


var fs          = require('fs');
var yaml        = require('js-yaml');
var util        = require('util');
var worker_http = require('./worker_http');

function worker() {
  return {
    job: null,
    config: {},
    init: function( callback ) {
      var parent = this;
      var result = opts.fs.existsSync( __dirname + '/worker.yml');

      if(!result) throw "no config file!";

      var config = opts.fs.readFileSync( __dirname + '/worker.yml', null);
      this.config = yaml.load(config);

      opts.worker_http.jobs.next(this.config.worker_id, function( data ){
        parent.job = jobBuilder.create( data );
        if( opts["jobs_next_after"] )
          opts["jobs_next_after"](data);
      });

      if(callback) callback.call(this);
    }
  };
}


module.exports = worker();

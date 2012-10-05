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


var ev  = require('events'), EventEmitter = ev.EventEmitter;
var util = require('util');

var Eventer = function(){
  ev.EventEmitter.call(this);
};

util.inherits(Eventer, ev.EventEmitter);

var Worker = {
  create: function( mocks ) {
    var e = new Eventer();

    var CONFIG_FILE = __dirname + '/worker.yml';

    function dep(name) {
      mocks[name] = mocks[name] || require(name);
      return mocks[name];
    }

    function setup_events() {
      this.on('has_config', function(){
        var parent = this;
        dep('fs').readFile(CONFIG_FILE, null, function( contents ){
          // load the config
          parent.config = dep('js-yaml').load(contents);

          e.emit('config_loaded', parent.config);
          e.emit('picking_job');
        });
      });

      this.on('picking_job', function(){
        dep('http').request({ method: "POST", host: "proggr.apphb.com", path: '/jobs/next', worker_id: this.config.worker_id }, function(res) {
          var job = dep('./job_creator').create(res);
          e.emit('picked_job', job);
        });
      });
    }

    return {
      job: null,
      config: {},
      on: function(name, fn) {
        e.on(name, fn);
      },
      init: function( callback ) {
        setup_events.call(this);

        dep('fs').exists( CONFIG_FILE, function(exists){
          if(!exists) {
            e.emit('no_config');
          } else {
            e.emit('has_config');
          }
        });
      }
    }
  }
};


module.exports = Worker;

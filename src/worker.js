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
var path = require('path');

var Eventer = function(){
  ev.EventEmitter.call(this);
};

util.inherits(Eventer, ev.EventEmitter);

var Worker = {
  create: function( mocks ) {
    var e = new Eventer();
    var mocks = mocks || {};

    var CONFIG_FILE = path.resolve(__dirname + '/worker.yml');

    function dep(name) {
      mocks[name] = mocks[name] || require(name);
      return mocks[name];
    }

    function setup_events() {
      var parent = this;

      parent.on('has_config', function(){
        var worker = parent;
        dep('fs').readFile(CONFIG_FILE, null, function( err, contents ){
          // load the config
          worker.config = dep('js-yaml').load(contents);

          e.emit('config_loaded', worker.config);
          e.emit('picking_job');
        });
      });

      parent.on('picking_job', function(){
        var post_data = "worker_id=" + parent.config.worker_id;
        var post_options = {
          method: "POST",
          host: "proggr.apphb.com", // TODO: change this to YAML config
          path: '/jobs/next',       // TODO: change this to YAML config
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          }
        };
        var request = dep('http').request(post_options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            var job = dep('./job_creator').create(JSON.parse(chunk).Data.Job);
            e.emit('picked_job', job);
          });
        });
        request.write(post_data);
        request.end();
      });

      parent.on('picked_job', function(job){
        job.run(parent);
      });
    }

    var _worker = {
      job: null,
      config: {},
      debug: false,
      on: function(name, fn) {
        e.on(name, fn);
      },
      init: function( callback ) {
        dep('fs').exists( CONFIG_FILE, function(exists){
          if(!exists) {
            e.emit('no_config');
          } else {
            e.emit('has_config');
          }
        });
      },
      finish_job: function( job ) {
        e.emit('finish_job', job.data );
        setTimeout(function(){
          // pick another job!
          e.emit('picking_job');
        }, 1);

      }
    };

    setup_events.call(_worker);

    return _worker;
  }
};


module.exports = Worker;

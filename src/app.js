var util = require('util');
var Worker = require('./worker');

// start the worker!

var current_worker = new Worker();
current_worker.init(function cb() {
  util.puts('proggr worker v0.1 loaded! Welcome to the hive!');
  util.puts('your ID: ' + this.config.worker_id );
});

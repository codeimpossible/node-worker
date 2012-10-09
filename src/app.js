var util = require('util');
var Worker = require('./worker');

// oh so simple template function
var template = function(template, model) {
  for(var p in model) {
    if( model.hasOwnProperty(p) ) {
      var re = new RegExp( "#{" + p + "}", "ig" );
      template = template.replace(re, model[p]);
    }
  }
  return template;
};


var worker = Worker.create();

process.on('exit', function () {
  console.log('About to exit.');
});

// Start reading from stdin so we don't exit.
process.stdin.resume();


// print process.argv
process.argv.forEach(function (val, index, array) {
  if( val === "-d" ) {
    worker.debug = true;
  }
});

worker.on('config_loaded', function( config ){
  util.puts('proggr worker v0.1 loaded! Welcome to the hive!');
  util.puts('your ID: ' + config.worker_id );
});

worker.on('picking_job', function(){
  util.puts('picking a new job.');
});

worker.on('picked_job', function(job){
  util.puts( template("picked job: #{type}", job ) );
  util.puts( "starting job..." );
});

worker.init();

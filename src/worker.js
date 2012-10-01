var fs = require('fs');
var yaml = require('js-yaml');
var util = require('util');

function worker(_fs) {
  fs = _fs || fs; // allow ctor injection
  return {
    config: {},
    init: function() {
      var result = fs.existsSync( __dirname + '/worker.yml');

      if(!result) throw "no config file!";

      var config = fs.readFileSync( __dirname + '/worker.yml', null);
      this.config = yaml.load(config);

      util.puts('proggr worker v0.1 loaded! Welcome to the hive!');
      util.puts('your ID: ' + this.config.worker_id );
    }
  };
}


module.exports = worker;

var fs = require('fs');
var yaml = require('js-yaml');
var util = require('util');

function worker(_fs) {
  fs = _fs || fs; // allow ctor injection
  return {
    config: {},
    init: function( callback ) {
      var result = fs.existsSync( __dirname + '/worker.yml');

      if(!result) throw "no config file!";

      var config = fs.readFileSync( __dirname + '/worker.yml', null);
      this.config = yaml.load(config);

      if(callback) callback.call(this);
    }
  };
}


module.exports = worker;

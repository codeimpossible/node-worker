var FakeResponseObj = function(mock_data){
  var ev    = require('events'),
      util  = require('util');
  var Eventer = function(){
    ev.EventEmitter.call(this);
  };

  util.inherits(Eventer, ev.EventEmitter);

  var e = new Eventer();

  this.mockData = JSON.stringify(mock_data);

  this.setEncoding = function( enc ) {
    e.emit('on_set_encoding', enc);
  }

  this.on = function(name, fn) {
    e.on(name, fn);
  };

  this.sendData = function() {
    e.emit('data', this.mockData);
  };
};

module.exports = FakeResponseObj;

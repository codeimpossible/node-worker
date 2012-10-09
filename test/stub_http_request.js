var HttpResponse = require('./stub_http_response');

var FakeHttpRequestObject = function( mockResponseData ) {
  var ev    = require('events'),
      util  = require('util');
  var Eventer = function(){
    ev.EventEmitter.call(this);
  };

  // make a fake response if none supplied
  mockResponseData = mockResponseData || { Data: { Job: { type: "test" } } };

  util.inherits(Eventer, ev.EventEmitter);

  var e = new Eventer();

  var response = new HttpResponse( mockResponseData );

  var numTimes = 100, times = 0;

  this.httpResponse = function() {
    return response;
  }

  this.request = function(options, fn) {
    if( times++ >= numTimes ) {
      // only allow the callbacks to go for a certain number of calls
      var dummy = { write: function(){}, end: function(){} };
      this.request = function(){
        return dummy;
      };
      return dummy;
    }

    e.emit('request', options);
    fn(response);

    return {
      write: function ( data ) {
        e.emit('write', data);
      },
      end: function() {
        response.sendData();
      }
    };
  };

  this.on = function(name, fn) {
    e.on(name, fn);
    return this;
  };

  this.allow = function( times ) {
    numTimes = times;
    return this;
  };

  this.onData = function( fn ) {
    this.httpResponse().on('data', fn);
    return this;
  };
};

module.exports = FakeHttpRequestObject;

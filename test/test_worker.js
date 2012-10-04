describe('Worker', function(){
  var helpers     = require('./test_helpers');
  var loadModule  = require('./module-loader').loadModule;
  var mocks       = require('mocks');
  var assert      = require("assert");

  var module, fsMock, mockRequest, mockResponse, Worker;

  Function.prototype.after = function(ms) {
    var current = this;
    var args = arguments;
    function delay(){
      var arr = [];
      current.apply(this, arr.slice.call(args, 1));
    }
    this.after_timeout = setTimeout(delay, ms);
    return this.after_timeout;
  };

  Function.prototype.prevent = function() {
    clearTimeout(this.after_timeout);
  }

  beforeEach(function() {
    fsMock = mocks.fs.create();

    Worker = require('../src/worker');
  });


  describe('#job', function() {
    it('should exist', function(){
      var worker = Worker.create();

      assert.ok( worker.hasOwnProperty('job') );
    })
  })

  describe('#init()', function(){
    it('should exist', function(){
      var worker = Worker.create();
      assert.ok( worker.hasOwnProperty('init') );
    })

    it('should emit no_config event if worker.yml does not exist', function( done ){
      var worker = Worker.create({ fs: { exists: function(file, ev) { ev(false); } } });

      done.after(1000, "no_config event did not get called when the config was missing!");

      worker.on('no_config', function(){
        done.prevent();
        done();
      } );

      worker.init();
    })

    it('should emit has_config event if worker.yml exists', function( done ){
      var worker = Worker.create({ fs: { exists: function(file, ev) { ev(true); }, readFile: function(){} } });

      done.after(1000, "has_config event did not get called when the config exists!");

      worker.on('has_config', function(){
        done.prevent();
        done();
      } );

      worker.init();
    })

    it('should emit config_loaded event if worker.yml is loaded successfully', function( done ){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        }
      });

      done.after(1000, "config_loaded event did not get called when the config is loaded!");

      worker.on('config_loaded', function(data){
        done.prevent();
        done();
      } );

      worker.init();
    })

    it('should emit picking_job after initialization', function( done ){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        }
      });

      done.after(1000, "picking_job event did not get called when initialization was done!");

      worker.on('picking_job', function(data){
        done.prevent();
        done();
      } );

      worker.init();
    })
  });

  describe('#config', function(){
    it('should exist', function(){
      var worker = Worker.create();

      assert.ok( worker.config );
    })

    it('should be populated if worker.yml is loaded successfully', function( done ){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        }
      });

      done.after(1000, "config property did not get populated when the config is loaded!");

      worker.on('config_loaded', function(data){
        assert.notEqual(null, data);
        assert.equal("testWorker", data.worker_id);
        done.prevent();
        done();
      } );

      worker.init();
    })
  });

  describe('picking_job event', function(){
    it('should be emitted after configuration is loaded', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        }
      });

      done.after(1000, "picking_job event did not get emitted when the config is loaded!");

      worker.on('picking_job', function(){
        done.prevent();
        done();
      } );

      worker.init();
    });
  });
});


describe('Worker', function(){
  var helpers     = require('./test_helpers');
  var mocks       = require('mocks');
  var assert      = require("assert");

  var module, fsMock, Worker;

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

    it('should make a POST request to proggr website', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        },
        http: {
          request: function(options, fn) {
            assert.equal(options.method, "POST");
            done.prevent();
            done();
          }
        }
      });

      done.after(1000, 'picking_job handler did not make POST request to proggr website');

      worker.init();
    });

    it('should make a POST request to http://proggr.apphb.com/jobs/next', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        },
        http: {
          request: function(options, fn) {
            assert.equal(options.host, "proggr.apphb.com");
            assert.equal(options.path, '/jobs/next');
            done.prevent();
            done();
          }
        }
      });

      done.after(1000, 'picking_job handler did not make POST request to proggr website');

      worker.init();
    });

    it('should POST worker_id to http://proggr.apphb.com/jobs/next', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        },
        http: {
          request: function(options, fn) {
            assert.ok( options.worker_id );
            assert.equal( "testWorker", options.worker_id);
            done.prevent();
            done();
          }
        }
      });

      done.after(1000, 'picking_job handler did not make POST request to proggr website');

      worker.init();
    });

    it('should pass response to job creator', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        },
        './job_creator': {
          create: function( jobPack ) {
            assert.ok(jobPack);
            assert.equal("test", jobPack.type);
            done.prevent();
            done();
            return { run: function(){} }
          }
        },
        http: {
          request: function(options, fn) {
            fn({ type: "test" });
          }
        }
      });

      done.after(1000, 'job_creator#create was not called');

      worker.init();
    });

    it('should emit the picked_job event', function(done){
      var worker = Worker.create({
        fs: {
          exists: function(file, ev) { ev(true); },
          readFile: function(file, type, ev) { ev("worker_id: testWorker"); }
        },
        './job_creator': {
          create: function( jobPack ) {
            return jobPack;
          }
        },
        http: {
          request: function(options, fn) {
            fn({ type: "test", run: function(){} });
          }
        }
      });

      worker.on('picked_job', function(job){
        assert.notEqual(null, job);
        assert.equal("test", job.type);
        done.prevent();
        done();
      });

      done.after(1000, 'job_creator#create was not called');

      worker.init();
    });
  });
});


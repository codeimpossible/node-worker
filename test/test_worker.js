describe('Worker', function(){
  var helpers     = require('./test_helpers');
  var loadModule  = require('./module-loader').loadModule;
  var mocks       = require('mocks');
  var assert      = require("assert");

  var module, fsMock, mockRequest, mockResponse;

  beforeEach(function() {
    fsMock = mocks.fs.create();
    mockRequest = mocks.http.request.create();
    mockResponse = mocks.http.response.create();

    // load the module with mock fs instead of real fs
    // publish all the private state as an object
    module = loadModule('../src/worker.js', /* mocks */ {fs: fsMock});
  });


  describe('#job', function() {
    it('should exist', function(){
      assert.ok( module.hasOwnProperty('job') );
    })
  })

  describe('#init()', function(){
    it('should exist', function(){
      assert.ok( testWorker.hasOwnProperty('init') );
    })

    it('should fail if worker.yml does not exist', function(){
      // arrange
      testWorker = new Worker( helpers.fileSystemNoExist() );

      // act
      try {
        testWorker.init();
        assert.ok(false, "Worker#init did not fail when no config was present");
      }catch(e) {
        assert.equal(e, "no config file!");
      }
    })

    it('should load the config', function(){
      // arrange
      var config = "worker_id: test_worker";
      testWorker = new Worker( helpers.fileSystemReturnsConfig(config) );

      // act
      testWorker.init();

      // assert
      assert.equal('test_worker', testWorker.config['worker_id'], "config wasn't loaded correctly!");
    })

    it('should call any callback functions passed', function() {
      testWorker = new Worker( helpers.successStoryBootstrap() );

      try {
        testWorker.init(function(){
          throw "callback called!";
        });
        assert.ok(false, "Worker#init did not call the passed callback!");
      } catch(e) {
        assert.equal('callback called!', e);
      }
    })

    it('should populate a job into the jobs list', function(){
      testWorker = new Worker( helpers.successStoryBootstrap() );

      testWorker.init();

      assert.equal(1, testWorker.job);
    })
  });
});


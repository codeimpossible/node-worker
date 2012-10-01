var helpers = require('./test_helpers');
var assert = require("assert");
var Worker = require('../src/worker');

describe('Worker', function(){
  var testWorker = new Worker();

  describe('#init()', function(){
    it('should exist', function(){
      assert.ok( testWorker['init'] );
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
  });
});


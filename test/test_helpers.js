var helpers = {
  fileSystemNoExist: function() {
    return {
      fs: {
        existsSync: function(path) {
          return false;
        }
      }
    };
  },
  fileSystemReturnsConfig: function( config_contents ) {
    var _contents = config_contents;
    return {
      fs: {
        existsSync: function( path ) {
          return true;
        },
        readFileSync: function(path) {
          return _contents;
        }
      }
    }
  },
  successStoryBootstrap: function() {
    var config = "worker_id: test_worker";
    return this.fileSystemReturnsConfig(config);
  }
};

module.exports = helpers;

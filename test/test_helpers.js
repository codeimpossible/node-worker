var helpers = {
  fileSystemNoExist: function() {
    return {
      existsSync: function(path) {
        return false;
      }
    };
  },
  fileSystemReturnsConfig: function( config_contents ) {
    var _contents = config_contents;
    return {
      existsSync: function( path ) {
        return true;
      },
      readFileSync: function(path) {
        return _contents;
      }
    }
  }
};

module.exports = helpers;

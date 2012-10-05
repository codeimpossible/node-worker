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

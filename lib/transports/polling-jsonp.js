
/**
 * Module requirements.
 */

var Transport = require('../transport')
  , Polling = require('./polling')
  , util = require('../util')

/**
 * Noop.
 */

function empty () { }

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Transport.call(this, opts);
  this.setIndex();
};

/**
 * Inherits from Polling.
 */

util.inherits(JSONPPolling, Polling);

/**
 * Sets JSONP global callback.
 *
 * @api private
 */

JSONPPolling.prototype.setIndex = function () {
  var self = this;

  // if we have an index already, set it to empy
  if (undefined != this.index) {
    io.j[this.index] = empty;
  }

  this.index = io.j.length;
  io.j.push(function (msg) {
    self.onData(msg);
  });
};

/**
 * Opens the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doOpen = function () {
  var self = this;
  util.defer(function () {
    Polling.prototype.doOpen.call(self);
  });
};

/**
 * Closes the socket
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  this.setIndex();

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
  }
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this
    , script = document.createElement('script')
    , query = io.util.query(
           this.socket.options.query
        , 't='+ (+new Date) + '&i=' + this.index
      );

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.prepareUrl() + query;

  var insertAt = document.getElementsByTagName('script')[0]
  insertAt.parentNode.insertBefore(script, insertAt);
  this.script = script;

  if (util.ua.gecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

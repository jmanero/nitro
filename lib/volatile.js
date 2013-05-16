var EventEmitter = require('events').EventEmitter;
var Util = require('util');

/*******************************************************************************
 * Common timeout handler
 * 
 * @param timeout
 *            Optional timeout for promise
 * @emits timeout on Timer expire
 ******************************************************************************/
var Volatile = module exports = function(timeout) {
	EventEmitter.call(this);
	this.timeout = +timeout || false;
};
Util.inherits(Volatile, EventEmitter);

/**
 * Set Timer
 * 
 * @param timeout
 *            Optional timeout
 */
Volatile.prototype.setTimeout = function(timeout) {
	var self = this;
	timeout = +timeout || this.timeout;

	if (!timeout)
		return;

	this._timeout = setTimeout(function() {
		delete self._timeout;
		self.emit('timeout');
	}, timeout);
	
	return timeout;
};

/**
 * Reset Timer
 * 
 * @param timeout
 *            Optional timeout
 */
Volatile.prototype.resetTimeout = function(timeout) {
	if (this._timeout)
		clearTimeout(this._timeout);

	return this.setTimeout(timeout);
};

/**
 * Clear Timer
 */
Volatile.prototype.clearTimeout = function() {
	if (!this._timeout)
		return;

	clearTimeout(this._timeout);
	delete this._timeout;
};

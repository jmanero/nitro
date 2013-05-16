var EventEmitter = require('events').EventEmitter;
var SimpleUID = require('simple-uid');
var Util = require('util');
var Volatile = require('./volatile');

var Store = module.exports = function(timeout) {
	EventEmitter.call(this);
	this.data = {};
	this.timeout = +timeout || false;
};
Util.inherits(Store, EventEmitter);

var Entry = function(value, timeout) {
	Volatile.call(this, timeout);
	this.data = [ value ];

};
Util.inherits(Entry, Volatile);

Entry.prototype.append = function(value) {
	this.data.push(value);
};

Entry.prototype.value = function() {
	return this.data;
};

Store.prototype.get = function(key) {
	if (this.data[key])
		return this.data[key].value();
};

Store.prototype.post = function(key, value, timeout) {
	var self = this;
	this.del(key); // Ensure that no lingering T/Os exist

	timeout = (isNaN(+timeout) ? this.timeout : +timeout);
	var entity = this.data[key] = new Entity(value, timeout);
	
	entity.on('timeout', function() {
		self.emit('timeout', key, entity.value());
		delete this.data[key];
	});
};

Store.prototype.append = function(key, value, timeout) {
	if (this.data[key]) {
		this.data[key].append(value);
		this.data[key].resetTimeout(timeout);

		return;
	}

	this.post(key, value, timeout);
};

Store.prototype.freeze = function(key) {
	if (this.data[key])
		this.data[key].clearTimeout();
};

Store.prototype.unfreeze = function(key, timeout) {
	if (this.data[key])
		this.data[key].setTimeout(timeout);
};

Store.prototype.del = function(key) {
	if (this.data[key]) {
		this.data[key].clearTimeout();
		delete this.data[key];
	}
};

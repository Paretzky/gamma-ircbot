var fs = require("fs");
var net = require("net");
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
exports.fs = fs;
exports.net = net;
exports.emitStream = emitStream;
exports.JSONStream = JSONStream;
try {
	exports.config = JSON.parse(fs.readFileSync("config.json").toString());
} catch(e) {
	console.log("Unable to parse config.json.  Error: %s", e);
	process.exit(2);
}
var sqlite3 = null;
var db = null;
exports.getDB = function() {
	if(sqlite3 == null) {
		sqlite3 = require("sqlite3");
	}
	if(db == null) {
		db = new sqlite3.Database("myirc.js.sqlite3");
	}
	return db;
}
var stream = null;
exports.getStream = function() {
	if(stream == null) {
		var input = emitStream.fromStream(net.connect(exports.config.pipePath).pipe(JSONStream.parse([true])));
		var output = new EventEmitter;
		emitStream.toStream(output).pipe(JSONStream.stringify()).pipe(net.connect(exports.config.pipePath));
		stream = {input:input,output:output,
				emit: function() {
					console.log(arguments);
					for(var i = 0; i < arguments.length; i++) {
						if(i>0) {
							arguments[i] = arguments[i];
						}
					}
					console.log(arguments);
					return output.emit.apply(output,arguments);
				},
				on: function() {
					return input.on.apply(input,arguments);
				},
			};
	}
	return stream;
};

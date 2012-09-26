var readline = require("readline");
var fs = require("fs");
var net = require("net");
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("myirc.js.sqlite3");
var config;
try {
	config = JSON.parse(fs.readFileSync("config.json").toString());
} catch(e) {
	console.log("Unable to parse config.json.  Error: %s", e);
	process.exit(2);
}
var stream = (function() {
	var input = emitStream.fromStream(net.connect(config.pipePath).pipe(JSONStream.parse([true])));
	var output = new EventEmitter;
	emitStream.toStream(output).pipe(JSONStream.stringify()).pipe(net.connect(config.pipePath));
	return {input:input,output:output};
})();
stream.input.on("cmdReply",function(m) {
	console.log(m);
});
var rl = readline.createInterface(process.stdin,process.stdout,null,true);
rl.setPrompt("# ", 2);
rl.on("line",function(line) {
	if(line.trim().match(/^exit$/i) != null) {
		process.exit(0);
	}
	stream.output.emit("cmd",line);
});

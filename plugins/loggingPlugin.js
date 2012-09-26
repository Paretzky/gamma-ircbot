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
db.get("SELECT name FROM sqlite_master WHERE name='loggingPlugin'", function(err,row) { 
	if(row == undefined) {
		db.run("CREATE TABLE loggingPlugin (fromNick char(128) COLLATE NOCASE,  toNick char(128) COLLATE NOCASE, ts timestamp, message text)");
	}
});
var stream = (function() {
	var input = emitStream.fromStream(net.connect(config.pipePath).pipe(JSONStream.parse([true])));
	var output = new EventEmitter;
	emitStream.toStream(output).pipe(JSONStream.stringify()).pipe(net.connect(config.pipePath));
	return {input:input,output:output};
})();
stream.input.on("message", function(nick,to,text,message) {
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@rand\s\w+/) != null) {
			var t = text.split(/\s+/);
			db.get("SELECT * FROM (SELECT * FROM loggingPlugin WHERE fromNick=? AND toNick=?) ORDER BY RANDOM() LIMIT 1",t[1],to,function(err,row) {
				if(row != null) {
					stream.output.emit("say",to,row.message);
				} else {
					stream.output.emit("say",to,"I have no log of " + t[1] + " in " + to);
				}
				return;
			});
		}
	}
	db.run("INSERT INTO loggingPlugin VALUES(?, ?, datetime('now','localtime'), ?)", nick, to, text);
});

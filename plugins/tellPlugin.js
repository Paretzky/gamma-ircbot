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
db.get("SELECT name FROM sqlite_master WHERE name='tellPlugin'", function(err,row) { 
	if(row == undefined) {
		db.run("CREATE TABLE tellPlugin (fromNick char(128),  toNick char(128), channel char(128), ts timestamp, message text)");
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
		if(text.match(/^\@tell\s/) != null) {
			var t = text.substring(5).trim();
			var m = t.match(/^\w+\s+/)
			if(m != null) {
				var tellTo = m[0].trim();
				var tellMsg = t.substring(m[0].length);
				db.run("INSERT OR REPLACE INTO tellPlugin VALUES(?,?,?,datetime('now','localtime'),?)",nick,tellTo,to,tellMsg);
				stream.output.emit("say",to,"I'll tell " + tellTo + " next time then join " + to);
			}
		}
	}
});
stream.input.on("join",function(channel, nick, message) {
	db.all("SELECT *,rowid FROM tellPlugin WHERE channel=? AND toNick=? COLLATE NOCASE",channel,nick,function(err,row) {
		if(row == null) {
			console.log("norow");
			return;
		}
		row.forEach(function(row,index,array) {
			stream.output.emit("say",channel,row.fromNick + " left a message for " + row.toNick + " at " + row.ts + ": " + row.message);
			db.run("DELETE FROM tellPlugin WHERE rowid=?", row.rowid);
		});
	});
});

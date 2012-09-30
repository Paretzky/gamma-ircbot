var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/logging.js:\t";
var db = myirc2.getDB();
stream.emit("log",LOG_PREFIX + "Starting");
db.get("SELECT name FROM sqlite_master WHERE name='loggingPlugin'", function(err,row) {
	if(row == undefined) {
		stream.emit("log",LOG_PREFIX + "Missing database table 'loggingPlugin', attempting to create");
		db.run("CREATE TABLE loggingPlugin (fromNick char(128) COLLATE NOCASE,  toNick char(128) COLLATE NOCASE, ts timestamp, message text)",function(e) {
			if(e == null) {
				stream.emit("log",LOG_PREFIX + "Created new database table 'loggingPlugin'");
				db.run("CREATE INDEX loggingPlugin_toNick ON loggingPlugin(fromNick,toNick);",function(e2) {
					if(e2 == null) {
						stream.emit("log",LOG_PREFIX + "Created new database index on 'loggingPlugin(fromNick,toNick)'");
					} else {
						stream.emit("log",LOG_PREFIX + "Unable to create database index on 'loggingPlugin(fromNick,toNick)', exiting plugin");
						process.exit(1);
					}
				});
			} else {
				stream.emit("log",LOG_PREFIX + "Unable to create database table 'loggingPlugin', exiting plugin");
				process.exit(1);
			}
		});
	}
});
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@rand\s\w+/) != null) {
			var t = text.split(/\s+/);
			stream.emit("log",LOG_PREFIX + nick + " requested random quote for " + t[1] + " in " + to);
			db.get("SELECT * FROM (SELECT * FROM loggingPlugin WHERE fromNick=? AND toNick=?) ORDER BY RANDOM() LIMIT 1",t[1],to,function(err,row) {
				if(row != null) {
					stream.emit("log",LOG_PREFIX + "Found random quote for " + t[1] + " in " + to);
					stream.emit("client.say",to,"[" + row.ts + "] " + row.fromNick + ": " + row.message);
				} else {
					stream.emit("log",LOG_PREFIX + "Unable to find random quote for " + t[1] + " in " + to);
					stream.emit("client.say",to,"I have no log of " + t[1] + " in " + to);
				}
				return;
			});
		}
	}
	db.run("INSERT INTO loggingPlugin VALUES(?, ?, datetime('now','localtime'), ?)", nick, to, text);
});

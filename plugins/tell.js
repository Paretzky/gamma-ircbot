var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/tell.js:\t";
var db = myirc2.getDB();
stream.emit("log",LOG_PREFIX + "Starting");
db.get("SELECT name FROM sqlite_master WHERE name='tellPlugin'", function(err,row) {
	if(row == undefined) {
		stream.emit("log",LOG_PREFIX + "Missing database table 'tellPlugin', attempting to create");
		db.run("CREATE TABLE tellPlugin (fromNick char(128) COLLATE NOCASE,  toNick char(128) COLLATE NOCASE, channel char(128) COLLATE NOCASE, ts timestamp, message text)",function(e) {
			if(e == null) {
				stream.emit("log",LOG_PREFIX + "Created new database table 'tellPlugin'");
				db.run("CREATE INDEX tellPlugin_index ON tellPlugin(channel,fromNick)",function(e2) {
					if(e2 == null) {
						stream.emit("log",LOG_PREFIX + "Created new database index on 'tellPlugin(channel,fromNick)'");
					} else {
						stream.emit("log",LOG_PREFIX + "Unable to create database index on 'tellPlugin(channel,fromNick)', exiting plugin");
						process.exit(1);
					}
				});
			} else {
				stream.emit("log",LOG_PREFIX + "Unable to create database table 'tellPlugin', exiting plugin");
				process.exit(1);
			}
		});
	}
});
var parseMessage =  function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	message = unescape(message);
	if(myirc2.pluginBlacklistedInChannel("tell",to)) {
		return;
	}
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@tell\s/) != null) {
			var t = text.substring(5).trim();
			var m = t.match(/^\w+\s+/)
			if(m != null) {
				var tellTo = m[0].trim();
				var tellMsg = t.substring(m[0].length);
				stream.emit("log", LOG_PREFIX+nick+" left a message for "+tellTo+" in "+nick);
				db.run("INSERT OR REPLACE INTO tellPlugin VALUES(?,?,?,datetime('now','localtime'),?)",nick,tellTo,to,tellMsg);
				stream.emit("client.say",to,"I'll tell " + tellTo + " next time they join or talk");
				return;
			}
		}
		db.all("SELECT *,rowid FROM tellPlugin WHERE channel=? AND toNick=?",to,nick,function(err,row) {
			if(row == null) {
				return;
			}
			row.forEach(function(row,index,array) {
				stream.emit("log",LOG_PREFIX+row.fromNick + " left a message for " + row.toNick + " at " + row.ts + ": " + row.message);
				stream.emit("client.say",to,row.fromNick + " left a message for " + row.toNick + " at " + row.ts + ": " + row.message);
				db.run("DELETE FROM tellPlugin WHERE rowid=?", row.rowid);
			});
		});
	}
};
stream.on("irc.message",parseMessage);
stream.on("irc.join",function(channel,nick,message) {
	if(myirc2.pluginBlacklistedInChannel("tell",channel)) {
		return;
	}
	parseMessage(nick,channel,undefined,message);
});

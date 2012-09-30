var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/regex.js:\t";
var prev = {};
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message",function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(prev.hasOwnProperty(to) && text.match(/^s\//) != null) {
		stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with " + text + " on " + prev[to]);
		text = text.substring(2);
		var find = [];
		var replacement = [];
		var escaped = false;
		var replaceMode = false;
		text.split("").forEach(function(e) {
			if(e == "/") {
				if(escaped) {
					escaped = false;
					if(replaceMode) {
						replacement.push(e);
					} else {
						find.push(e);
					}
				} else {
					replaceMode = true;
				}
			} else if(e == "\\") {
				if(escaped) {
					escaped = false;
					if(replaceMode) {
						replacement.push(e);
					} else {
						find.push(e);
					}
				} else {
					escaped = true;
					if(replaceMode) {
						replacement.push(e);
					} else {
						find.push(e);
					}
				}
			} else {
				escaped=false;
				if(replaceMode) {
					replacement.push(e);
				} else {
					find.push(e);
				}
			}
		});
		var rString = find.join("");
		try {
			var r = new RegExp(rString,"g");
		} catch(e) { 
			stream.emit("log",LOG_PREFIX+"Error with " + text + ". " + e + " regex: " + rString);
			return; 
		}
		stream.emit("log",LOG_PREFIX+"Completed " + text);
		stream.emit("client.say",to,prev[to].replace(r,replacement.join("")));
		return;
	}
	prev[to] = text;
});

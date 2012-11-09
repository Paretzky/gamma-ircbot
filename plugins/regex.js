var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/regex.js:\t";
var prev = {};
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message",parseMessage);
function parseMessage(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(myirc2.pluginBlacklistedInChannel("regex",to)) {
		return;
	}
	if(prev.hasOwnProperty(to) && text.match(/^s\//) != null) {
		stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with " + text + " on " + prev[to]);
		text = text.substring(1);
		var s = [];
		var escaped = false;
		var index = -1;
		text.split("").forEach(function(e) {
			if(e == "/" && !escaped) {
				s.push([]);
				index++;
				return;
			}
			if(e == "\\") {
				escaped = !escaped;
			} else {
				escaped = false;
			}
			s[index].push(e);
			
		});
		var r;
		try {
			if(s.length == 2) {
				r = new RegExp(s[0].join(""),"g");
			} else if(s.length == 3) {
				r = new RegExp(s[0].join(""),s[2].join(""));
			}
		} catch(e) {
			stream.emit("log",LOG_PREFIX+"Error with " + text + ". " + e);
			stream.emit("irc.message",to,"Error with " + text + ". " + e);
		}
		stream.emit("log",LOG_PREFIX+"Completed " + text);
		stream.emit("client.say",to,prev[to].replace(r,s[1].join("")));
		/*
		var find = [];
		var replacement = [];
		var escaped = false;
		var replaceMode = false;
		text.split("").forEach(function(e) {
			if(replaceMode) {
				replacement.push(e);
				return;
			}
			if(e == "/") {
				if(escaped) {
					escaped = false;
					find.push(e);
				} else {
					replaceMode = true;
					return;
				}
			} else if(e == "\\") {
				find.push(e);
				if(escaped) {
					escaped = false;
				} else {
					escaped = true;
				}
			} else {
				escaped=false;
				find.push(e);
			}
		});
		
		var fString = find.join("");	
		var rString = replacement.join("");
		var m = replacement.join("").match(/\s+\|\s+(s\/.+)/);
		try {
			var r = new RegExp(fString,"g");
		} catch(e) { 
			stream.emit("log",LOG_PREFIX+"Error with " + text + ". " + e + " regex: " + fString);
			return; 
		}
		if(m != null) {
			prev[to] = prev[to].replace(r,rString.substring(0,m.index));
			parseMessage(nick,to,m[1],{});
			return;
		}
		stream.emit("log",LOG_PREFIX+"Completed " + text);
		stream.emit("client.say",to,prev[to].replace(r,rString));
		return;
		*/
	}
	prev[to] = text;
}

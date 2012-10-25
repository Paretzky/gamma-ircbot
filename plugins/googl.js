var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/googl.js:\t";
var g = require("goo.gl");
stream.emit("log",LOG_PREFIX + "Starting");
g.setKey(config.googleaikey);
stream.on("irc.message",function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(myirc2.pluginBlacklistedInChannel("googl",to)) {
		return;
	}
	var m = text.indexOf("goo.gl\/");
	if(m != -1) {
		text = text.substring(m).split(/\s+/)[0];
		stream.emit("log",LOG_PREFIX +"Attempting to shorten " +text);
		g.expand(text,function(url) {
			if(url.status == "OK") {
				stream.emit("log",LOG_PREFIX + "Shortened " +  text + " to " + url.longUrl);
				stream.emit("client.say", to, text+" -> " +url.longUrl);
			} else {
				stream.emit("log",LOG_PREFIX + "Unable to shorten " + text);
			}
		});	
	}
});

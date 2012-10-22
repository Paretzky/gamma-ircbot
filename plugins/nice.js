var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/nice.js:\t";
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.toLowerCase().indexOf(config.irc.nick.toLowerCase()) != -1) {
			if(text.match(/(ha?i)|(hello)|(h(e|a)y)/i) != null) {
				stream.emit("client.say",to,"Hai " + nick + " =D");
				return;
			}
			if(text.match(/wb.?\s/i) != null) {
				stream.emit("client.say",to,"Thanks " + nick);
				return;
			}
		}
	}
});

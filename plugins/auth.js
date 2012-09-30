var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var authed = false;
var LOG_PREFIX = "plugins/auth.js:\t";
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.registered",function(m) {
	if(!authed) {
		stream.emit("log",LOG_PREFIX+"Sending identify tokens for user: " + config.irc.identUser);
		stream.emit("client.say","nickserv","identify " + config.irc.identUser + " " + config.irc.identPass);
	}
});
stream.on("irc.notice",function (nick, to, text, message) {
	nick = unescape(nick);
	text = unescape(text);
	if(nick == "NickServ" && text.match(/^You are now identified for/) != null && !authed) {
		authed = true;
		stream.emit("log",LOG_PREFIX + "Successfully identified as: " + config.irc.identUser);
		for(var c in config.irc.channels) {
			stream.emit("log",LOG_PREFIX + "Joining " + config.irc.channels[c]);
			stream.emit("client.join",config.irc.channels[c]);
		}
	}
});

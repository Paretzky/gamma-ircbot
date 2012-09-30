var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/qalc.js:\t";
var spawn = require('child_process').spawn;
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@calc\s/) != null) {
			var maths = text.split(/\s+/).splice(1).join(" ").trim();
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with expression: " + maths);
			var p = spawn("qalc",["-t", maths],{ stdio: "pipe" });
			p.stdout.on("data",function(d) {
				stream.emit("log",LOG_PREFIX + "Finished with expression: " + maths);
				stream.emit("client.say",to,d.toString().trim());
			});
			p.stderr.on("data",function(d) {
				//stream.emit("log",LOG_PREFIX + "Error: " + d.toString());
			});
		}
	}
});
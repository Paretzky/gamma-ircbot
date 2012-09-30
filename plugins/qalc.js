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
		if(text.match(/^\@calc\s\w+/) != null) {
			var maths = text.split(/\s+/).splice(1).join(" ");
			var p = spawn("qalc",["-t", maths],{ stdio: "pipe" });
			p.stdout.on("data",function(d) {
				stream.emit("client.say",to,d.toString());
			});
			p.stderr.on("data",function(d) {
				console.log("err:"+d.toString());
			});
		}
	}
});

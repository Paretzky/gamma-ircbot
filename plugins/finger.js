var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/finger.js:\t";
var spawn = require('child_process').spawn;
var timeoutInS = 2.5;
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@finger\s/) != null) {
			var maths = text.split(/\s+/).splice(1).join(" ").trim();
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with user: " + maths);
			var p = spawn("finger",[maths+"@moxie"],{ stdio: "pipe" });
			var toID = setTimeout(function(){
				p.kill('SIGKILL');
				stream.emit("log", LOG_PREFIX+"Query timed out: " + maths);
				stream.emit("client.say",to,"Query timed out: " + maths);
			},timeoutInS*1000);
	
			p.stdout.on("data",function(d) {
				clearTimeout(toID);
				stream.emit("log",LOG_PREFIX + "Finished with expression: " + maths);
				stream.emit("client.say",to,d.toString().trim());
			});
		}
	}
});

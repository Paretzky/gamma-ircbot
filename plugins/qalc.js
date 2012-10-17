var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/qalc.js:\t";
var spawn = require('child_process').spawn;
var timeoutInS = 2.5;
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@calc\s/) != null) {
			var maths = text.split(/\s+/).splice(1);
			var prec = 8;
			var base = 10;
			var count = 0;
			maths[0].replace(/\d+(p|P|b|B)/g,function() {
				if(arguments[0].match(/P|p$/) != null) {
					count++;
					prec = arguments[0].substring(0,arguments[0].length - 1);
					return "";
				}
				if(arguments[0].match(/B|b$/) != null) {
					count++;
					base = arguments[0].substring(0,arguments[0].length - 1);
					return "";
				}
			});
			if(count > 0) {
				maths = maths.splice(1).join(" ");
			}
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with args: " + base+"b"+prec+"p" + "  expression: " + maths);
			var p = spawn("qalc",["-t", "-set", "PRECISION\ " + prec, "-set", "BASE " + base, maths],{ stdio: "pipe" });
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

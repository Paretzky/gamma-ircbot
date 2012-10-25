var myirc2 = require("../includes/myirc2-helper.js");
var vimeo = require("vimeo")();
var url = require("url");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/vimeo.js:\t";
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message",function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(myirc2.pluginBlacklistedInChannel("vimeo",to)) {
		return;
	}
	var m = text.indexOf("vimeo.com\/");
	if(m != -1) {
		text = text.substring(m).split(/\s+/)[0];
		var text2 = text.split(/\//).splice(-1);
		vimeo.video(text2,function(err,res) {
			if(res != null) {
				res = res[0];
				stream.emit("log", LOG_PREFIX+"Previewed link " + text + " in " + to);
				stream.emit("client.say",to,"\"" + res.title + "\" (" + myirc2.secToString(res.duration) + ") uploaded by " + res.user_name);
			}
		});
	}
});

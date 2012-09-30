var myirc2 = require("../includes/myirc2-helper.js");
var youtube = require("youtube-feeds");
var url = require("url");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/youtube.js:\t";
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message",function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	var m = text.indexOf("youtube.com\/");
	if(m != -1) {
		text = text.substring(m).split(/\s+/)[0];
		youtube.video(url.parse(text,true).query.v, function(d) {
			if(d == null) {
				return;
			}
			stream.emit("log", LOG_PREFIX+"Previewed link " + text + " in " + to);
			stream.emit("client.say",to,"\"" + d.title + "\" (" + secToString(d.duration) + ") uploaded by " + d.uploader);
		});
	}
	m = text.indexOf("youtu.be\/");
	if(m != -1) {
		var parts = text.substring(m).split(/\s+/)[0].split("\/");
		text = parts[parts.length-1];
		youtube.video(text, function(d) {
			if(d == null) {
				return;
			}
			stream.emit("log", LOG_PREFIX+"Previewed link " + text + " in " + to);
			stream.emit("client.say",to,"\"" + d.title + "\" (" + secToString(d.duration) + ") uploaded by " + d.uploader);
		});
	}
});
function secToString(s) {
	var i = 0;
	while(s >= 60) {
		i++;
		s -= 60;
	}
	if(s == 0) {
		return i+"m";
	}
	return i+"m"+s+"s";
}

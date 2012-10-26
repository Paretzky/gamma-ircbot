var myirc2 = require("../includes/myirc2-helper.js");
var youtube = require("youtube-feeds");
var url = require("url");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/youtube.js:\t";
stream.emit("log",LOG_PREFIX + "Starting");
function formatResult(y) {
	if(y == null || y == undefined) {
		return "Unable to get result from Youtube.";
	}
	var res = ["\"",y.title,"\" (", myirc2.secToString(y.duration),") uploaded by ",y.uploader];
	if(y.hasOwnProperty("viewCount")) {
		res.push(" - ",commaizeInt(y.viewCount)," views");
	}
	if(y.hasOwnProperty("likeCount")) {
		res.push(" - ",commaizeInt(y.likeCount)," likes");
	}
	return res.join("");
	
}
function commaizeInt(n) {
	var s = String(n);
	if(s.length <= 3) {
			return s;
	}
	// Thanks http://stackoverflow.com/questions/721304/insert-commas-into-number-string
	return s.replace(/(\d)(?=(\d{3})+$)/g,function(){return arguments[0] + ",";});
}
stream.on("irc.message",function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(myirc2.pluginBlacklistedInChannel("youtube",to)) {
		return;
	}
	var m = text.indexOf("youtube.com\/");
	if(m != -1) {
		text = text.substring(m).split(/\s+/)[0];
		youtube.video(url.parse(text,true).query.v, function(d) {
			if(d == null) {
				return;
			}
			stream.emit("log", LOG_PREFIX+"Previewed link " + text + " in " + to);
			stream.emit("client.say",to,formatResult(d));
		});
	}
	m = text.indexOf("youtu.be\/");
	if(m != -1) {
		var parts = text.substring(m).split(/\s+/)[0].split("\/");
		text = parts[parts.length-1].split("?")[0];
		youtube.video(text, function(d) {
			if(d == null) {
				return;
			}
			stream.emit("log", LOG_PREFIX+"Previewed link " + text + " in " + to);
			stream.emit("client.say",to,formatResult(d));
		});
	}
});

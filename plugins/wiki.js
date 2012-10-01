var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/wiki.js:\t";
var http = require('http');
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@wiki\s/) != null) {
			var query = text.split(/\s+/).splice(1).join(" ").trim();
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with query: " + query);
			var url = "http://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exchars=200&exsectionformat=plain&titles=Python";
			var options = {
				host:"en.wikipedia.org",
				path:"/w/api.php?action=query&format=json&prop=extracts&exchars=200&exsectionformat=plain&titles=" + encodeURI(query),
				headers: { "user-agent": "IRC bot to preview wiki links"}
			};
			http.get(options,function(r) {
				console.log(r.statusCode);
				if(r != null && r.statusCode == 200) {
					var data = [];
					r.on('data', function (d) {
						data.push(d);
  					});
					r.on("end",function() {
						var res = JSON.parse(data.join(""));
						var page = Object.keys(res.query.pages)[0];
						var out = res.query.pages[page].extract.replace(/\s*<[\\\/]?(\w|\s)+[\\//]?>\s*/g," ").replace(/\n/g," ").replace(/\s*&#\d+;\s*/g," ").replace(/\s+/g," ").replace(/^\s+/,"");
						stream.emit("client.say",to,out + "\nhttp://en.wikipedia.org/wiki/" + encodeURI(query));
					});
				}
			});
		}
	}
});

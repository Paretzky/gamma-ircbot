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
	console.dir(config);
	if(myirc2.pluginBlacklistedInChannel("wiki",to)) {
		return;
	}
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@wiki\s/) != null) {
			//var query = toWikiCase(text.split(/\s+/).splice(1).join(" ").trim());
			var query = text.split(/\s+/).splice(1).join(" ").trim();
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with query: " + query);
			var url = "http://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exchars=225&exsectionformat=plain&titles=Python";
			var options = {
				host:"en.wikipedia.org",
				path:"/w/api.php?action=query&format=json&prop=extracts&redirects=yes&exchars=400&explaintext&exsectionformat=plain&titles=" + encodeURI(query),
				headers: { "user-agent": "IRC bot to preview wiki links"}
			};
			http.get(options,function(r) {
				//console.log(r.statusCode);
				if(r != null && r.statusCode == 200) {
					var data = [];
					r.on('data', function (d) {
						data.push(d);
  					});
					r.on("end",function() {
						var res = JSON.parse(data.join(""));
						var page = Object.keys(res.query.pages)[0];
						if(!res.query.pages[page].hasOwnProperty("extract")) {
							stream.emit("log","Processed query, missing page: " + query);
							stream.emit("client.say",to,"Missing page for: " + query);
							return;
						}
						var out = res.query.pages[page].extract.replace(/\s*<[\\\/]?(\w|\s)+[\\//]?>\s*/g," ").replace(/\n/g," ").replace(/\s*&#\d+;\s*/g," ").replace(/\s+/g," ").replace(/^\s+/,"");
						stream.emit("log",to,"Processed query: " + query);
						stream.emit("client.say",to,out + "\nhttp://en.wikipedia.org/wiki/" + encodeURI(res.query.pages[page].title));
					});
				}
			});
		}
	}
});
function toWikiCase(s) {
	var pCount = 0;
	return s.replace(/\(?\w+\)?/g,function() {
		if(arguments[0].charAt(0) == "(") {
			pCount++;
			return arguments[0].replace(/\(TV/i,"(TV");
		}
		if(pCount > 0) {
			if(arguments[0].indexOf(")") == arguments[0].length-1) {
				pCount--;
			}
			return arguments[0].toLowerCase();
		}
		return arguments[0].substring(0,1).toUpperCase() + arguments[0].substring(1).toLowerCase();
	});
}

var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var LOG_PREFIX = "plugins/people.js:\t";
var spawn = require('child_process').spawn;
var jsdom = require("jsdom").jsdom;
var timeoutInS = 2.5;
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("irc.message", function(nick,to,text,message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	if(to.substring(0,1) == "#") {
		if(text.match(/^\@people\s/) != null) {
			var parts = [];
			var maths = text.split(/\s+/).splice(1).join(" ").trim();
			stream.emit("log",LOG_PREFIX + nick + " triggered in " + to + " with user: " + maths);
			var p = spawn("wget",["-qO-", "http://www.oswego.edu/people_search/?action=Search&subsearch%5B%5D=dept&subsearch%5B%5D=fac&subsearch%5B%5D=stu&search="+encodeURI(maths)],{ stdio: "pipe" });
			var toID = setTimeout(function(){
				p.kill('SIGKILL');
				stream.emit("log", LOG_PREFIX+"Query timed out: " + maths);
				stream.emit("client.say",to,"Query timed out: " + maths);
			},timeoutInS*1000);
	
			p.stdout.on("data",function(d) {
				clearTimeout(toID);
				parts.push(d.toString());;
				//stream.emit("client.say",to,d.toString().trim());
			});
			p.stdout.on("end",function() {
				var p = jsdom.env(parts.join(""),[],function(err,window) {
					var w = window.document.getElementsByClassName("contenttxt")[0].innerHTML;
					if(w == null || w == undefined || w.length<5) {
						stream.emit("client.say",to,"Unable to deal with zero or multiple answers for now");
						return;
					}
					var w2 = w.match(/name:(\w|\s)+/i);
					if(w2 == null || w2 == undefined || w2.length<5) {
						stream.emit("client.say",to,"Unable to deal with zero or multiple answers for now");
						return;
					}
					w2.forEach(
						function(elem){
							if(elem.length>4){
								stream.emit("client.say",to,elem.replace(/\s*name:\s*/ig,"") + " - " + w.match(/email:.+/i)[0].substring(6).match(/:[^@]+@[^@\"]+/)[0].substring(1));
							}
						});
					
				});
			});
		}
	}
});

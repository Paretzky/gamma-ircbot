var myirc2 = require("./includes/myirc2-helper.js");
var config = myirc2.config;
var fs = require("fs");
var net = require("net");
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var server = (function() {
	var ev = new EventEmitter;
	var retVal = net.createServer({path:config.pipePath},function(c) {
		var input = emitStream.fromStream(c.pipe(JSONStream.parse([true])));
		emitStream.toStream(ev).pipe(JSONStream.stringify()).pipe(c);
		input.on("irc.registered",function(m) { ev.emit("irc.registered",m); });
		input.on("irc.motd",function(m) { ev.emit("irc.motd",m); });
		input.on("irc.names",function(channel,nicks) { ev.emit("irc.names",channel,nicks); });
		input.on("irc.topic",function(channel,topic,nick,message) { ev.emit("irc.topic",channel,topic,nick,message); });
		input.on("irc.join",function(channel,nick,message) { ev.emit("irc.join",channel,nick,message); });
		input.on("irc.part",function(channel,nick,reason,message) { ev.emit("irc.part",channel,nick,reason,message); });
		input.on("irc.quit",function(nick,reason,channels,message) { ev.emit("irc.quit",nick,reason,channels,message); });
		input.on("irc.kick",function(channel,nick,by,reason,message) { ev.emit("irc.kick",channel,nick,by,reason,message); });
		input.on("irc.message",function(nick,to,text,message) { ev.emit("irc.message",nick,to,text,message); });
		input.on("irc.notice",function(nick, to, text, message) { server.ev.emit("irc.notice",nick, to, text, message); });
		input.on("irc.pm",function(nick, text, message) { ev.emit("irc.pm",nick, text, message); });
		input.on("irc.nick",function(oldnick,newnick,channels,message) { ev.emit("irc.nick",oldnick,newnick,channels,message); });
		input.on("irc.raw",function(m) { ev.emit("irc.raw",m); });
		input.on("client.say",function(to,text) { ev.emit("client.say",to,text);});
		input.on("client.join",function(channel) { ev.emit("client.join",channel);});
		input.on("log",function(line) { console.log(unescape(line)); });
	});
	retVal.ev = ev;
	return retVal;
})();
server.listen(config.pipePath);
console.log("Listening on: " + config.pipePath);
spawn("node",["./proxy.js"]);
spawn("node",["./plugins/auth.js"]);
spawn("node",["./plugins/regex.js"]);
//sa.stderr.on("data", function(d) {
///  console.log('stderr: ' + d);
//});
/*
var s = spawn("node",["./plugins/auth.js"]);
s.stderr.on("data", function(d) {
  console.log('stderr: ' + d);
});
*/

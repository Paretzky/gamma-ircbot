var myirc2 = require("./includes/myirc2-helper.js");
var config = myirc2.config;
var fs = require("fs");
var net = require("net");
var emitStream = require('emit-stream');
var JSONStream = require('JSONStream');
var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var plugins = {};
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
		input.on("client.part",function(channel) { ev.emit("client.part",channel);});
		input.on("log",function(line) { console.log(unescape(line)); });
		
		input.on("plugin.stop",function(name){
			if(plugins.hasOwnProperty(name)) {
				console.log("Stopping plugin: " + name);
				plugins[name].process.kill('SIGKILL');
			}
		});
		input.on("plugin.logstdout",function(name){
			if(plugins.hasOwnProperty(name)) {
				console.log("Got request to log output of plugin: " + name + "\n" + plugins[name].stdout());
			}
		});
		input.on("plugin.unload",function(name) {
			if(plugins.hasOwnProperty(name)) {
				console.log("Unloading plugin: " + name);
				plugins[name].process.kill('SIGKILL');
				delete plugins[name];
			}
		});
		input.on("plugin.start",function(name) {
			// spawnPlugin checks for only running one instance of a plugin at a time
			spawnPlugin(name);
		});
	});
	retVal.ev = ev;
	return retVal;
})();
var triedUnlink = false;
server.on("error",function(e) {
	if (e.code == "EADDRINUSE") {
		if(triedUnlink) {
			return;
		}
		console.log("Trying to remove communications pipe: " + config.pipePath);
		//triedUnlink = true;
		//fs.unlink(config.pipePath);
		//Refuses to work for some magical reason, a return status for unlink would be helpful
		var p = spawn("unlink",[config.pipePath]);
		p.on("exit",function(code,signal) {
			if(triedUnlink) {
				return;
			}
			triedUnlink = true;
			if(code == 0) {
				console.log("Successfully removed previous pipe, attempting to create new pipe.");
			} else {
				console.log("Unable to remove pipe, exiting.");
				process.exit(4);
			}
			server.listen(config.pipePath);
		});
	}
});
server.listen(config.pipePath);
console.log("Listening on: " + config.pipePath);
function spawnPlugin(name) {
	if(!plugins.hasOwnProperty(name)) {
		plugins[name] = {
			process:	spawn("node",["plugins/"+name+".js"],{ stdio: "pipe" }),
			stdoutData:	[],
			stdout:		function(){ return this.stdoutData.join(""); }
		};
		plugins[name].process.stdout.on("data",function(d) {
			plugins[name].stdoutData.push(d);
		});
	}
}
spawn("node",["./proxy.js"]);
config.plugins.forEach(function(val,index,arr) {
	spawnPlugin(val);
});
/*
spawn("node",["./plugins/auth.js"]);
spawn("node",["./plugins/regex.js"]);
spawn("node",["./plugins/logging.js"]);
spawn("node",["./plugins/tell.js"]);
spawn("node",["./plugins/googl.js"]);
spawn("node",["./plugins/qalc.js"]);
spawn("node",["./plugins/vimeo.js"]);
spawn("node",["./plugins/nice.js"]);
*/

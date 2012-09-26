var fs = require("fs");
var net = require("net");
var irc = require("irc");
var emitStream = require('emit-stream');
var config,pipe,client,ppipe;
var server;
var EventEmitter = require('events').EventEmitter;
var JSONStream = require('JSONStream');
var authed = false;
var plugins = {};
var spawn = require('child_process').spawn;
try {
	config = JSON.parse(fs.readFileSync("config.json").toString());
} catch(e) {
	console.log("Unable to parse config.json.  Error: %s", e);
	process.exit(2);
}
var server = (function() {
	var ev = new EventEmitter;
	var retVal = net.createServer({path:config.pipePath},function(c) {
		var input = emitStream.fromStream(c.pipe(JSONStream.parse([true])));
		emitStream.toStream(ev).pipe(JSONStream.stringify()).pipe(c);
		input.on("say",function(to,text) {
			console.log("say " + to + " " + text);
			client.say(to,text);
		});
		input.on("join",function(channel) {
			client.join(channel);
		});
		input.on("cmd",function(m) {
			if(m == "loadplugins") {
				console.log("Starting to load plugins");
				loadPlugins();
				ev.emit("cmdReply", "Loaded " + config.plugins);
			}
			if(m == "listplugins") {
				ev.emit("cmdReply", "Currently running plugins:\n\t" + Object.keys(plugins).join("\n\t"));
			}
		});
	});
	retVal.ev = ev;
	return retVal;
})();
server.listen(config.pipePath);
var client = new irc.Client(config.irc.server,config.irc.nick, {debug:config.irc.debug,realName:config.irc.realName});
client.on("raw",function(m) {
	server.ev.emit("raw",m);
});
client.on("registered", function(m) {
	if(!authed) {
		client.say("nickserv","identify " + config.irc.identUser + " " + config.irc.identPass);
	}
	server.ev.emit("registered",m);
});
client.on("motd", function(m) {
	server.ev.emit("motd",m);
});
client.on("join", function(channel,nick,message) {
	server.ev.emit("join",channel,nick,message);
});
client.on("part", function(channel,nick,reason,message) {
	server.ev.emit("part",channel,nick,reason,message);
});
client.on("message", function(nick,to,text,message) {
	server.ev.emit("message",nick,to,text,message);
});
client.on("error", function(message) {
	server.ev.emit("error",message);
	console.log("Error: " + message);
});
config.irc.channels.forEach(function(elem,index,array) {
	client.on("message"+elem, function(nick,text,message) {
		server.ev.emit("message"+elem,nick,text,message);
	});
});
client.on("notice",function (nick, to, text, message) {
	if(nick == "NickServ" && text.match(/^You are now identified for/) != null && !authed) {
		authed = true;
		for(var c in config.irc.channels) {
			client.join(config.irc.channels[c]);
		}
	}
	server.ev.emit("notice",nick,to,text,message);
});
function loadPlugins() {
	config.plugins.forEach(function(elem,index,array) {
		if(!plugins.hasOwnProperty(elem)) {
			plugins[elem] = spawn("node", ["plugins/" + elem + "Plugin.js"]);
			plugins[elem].stderr.setEncoding('utf8');
			plugins[elem].stderr.on("data",function(d) {console.log("stderr:\t" + elem + "\t\t" + d);});
			console.log("Started " + elem);
		}
	});
}
function killAllPlugins() {
	config.plugins.forEach(function(elem,index,array) {
		if(plugins.hasOwnProperty(elem)) {
			var p = plugins.elem;
			delete plugins.elem;
			p.kill();
		}
	});
}

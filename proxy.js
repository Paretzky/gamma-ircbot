var myirc2 = require("./includes/myirc2-helper.js");
var config = myirc2.config;
var irc = require("irc");
var LOG_PREFIX = "proxy.js :\t\t";
var stream = myirc2.getStream();
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("client.join",function(channel) {
	channel = unescape(channel);	
	stream.emit("log",LOG_PREFIX + "JOIN\t" +  channel);
	client.join(channel);
});
stream.on("client.part",function(channel) {
	channel = unescape(channel);	
	stream.emit("log",LOG_PREFIX + "PART\t" +  channel);
	client.part(channel);
});
stream.on("client.say",function(to,text) {
	to = unescape(to);
	text = unescape(text);
	stream.emit("log",LOG_PREFIX + "SAY\t" +  to + "\t" + text);
	client.say(to,text);
});

var client = new irc.Client(config.irc.server,config.irc.nick, {debug:config.irc.debug,realName:config.irc.realName});
client.on("registered", function(m) {
	m = unescape(m);
	stream.emit("irc.registered",m);
});
client.on("motd", function(m) {
	m = unescape(m);
	stream.emit("irc.motd",m);
});
client.on("names", function(channel,nicks) {
	channel = unescape(channel);
	nicks = unescape(nicks);
	stream.emit("irc.names",channel,nicks);
});
client.on("topic", function(channel,topic,nick,message) {
	channel = unescape(channel);
	topic = unescape(topic);
	nick = unescape(nick);
	message = unescape(message);
	stream.emit("irc.topic",channel,topic,nick,message);
});
client.on("join", function(channel,nick,message) {
	channel = unescape(channel);
	nick = unescape(nick);
	message = unescape(message);
	stream.emit("irc.join",channel,nick,message);
});
client.on("part", function(channel,nick,reason,message) {
	channel = unescape(channel);
	nick = unescape(nick);
	reason = unescape(reason);
	message = unescape(message);
	stream.emit("irc.part",channel,nick,reason,message);
});
client.on("quit", function(nick,reason,channels,message) {
	nick = unescape(nick);
	reason = unescape(reason);
	channels = unescape(channels);
	message = unescape(message);
	stream.emit("irc.quit",nick,reason,channels,message);
});
client.on("kick", function(channel,nick,by,reason,message) {
	channel = unescape(channel);
	nick = unescape(nick);
	by = unescape(by);
	reason = unescape(reason);
	message = unescape(message);
	stream.emit("irc.kick",channel,nick,by,reason,message);
});
client.on("message", function(nick,to,text,message) {
	message = unescape(message);
	message = unescape(message);
	message = unescape(message);
	message = unescape(message);
	stream.emit("irc.message",nick,to,text,message);
});
client.on("notice",function (nick, to, text, message) {
	nick = unescape(nick);
	to = unescape(to);
	text = unescape(text);
	message = unescape(message);
	stream.emit("log",LOG_PREFIX + "NOTICE:\t" + text);
	stream.emit("irc.notice",nick,to,text,message);
});
client.on("pm",function (nick, text, message) {
	nick = unescape(nick);
	text = unescape(text);
	message = unescape(message);
	stream.emit("irc.pm",nick,text,message);
});
client.on("nick",function (oldnick,newnick,channels,message) {
	oldnick = unescape(oldnick);
	newnick = unescape(newnick);
	channels = unescape(channels);
	message = unescape(message);
	stream.emit("irc.nick",oldnick,newnick,channels,message);
});
client.on("raw",function(message){
	message = unescape(message);
	stream.emit("irc.raw",message);
});
client.on("error",function(e) {
	e = unescape(e);
	stream.emit("log",LOG_PREFIX + e.command);
});

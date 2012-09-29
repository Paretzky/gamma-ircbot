var myirc2 = require("./includes/myirc2-helper.js");
var config = myirc2.config;
var irc = require("irc");
var LOG_PREFIX = "proxy.js :\t\t";
var stream = myirc2.getStream();
stream.emit("log",LOG_PREFIX + "Starting");
stream.on("client.join",function(channel) {	
	stream.emit("log",LOG_PREFIX + "JOIN\t" +  channel);
	client.join(channel);
});
stream.on("client.say",function(to,text) {
	stream.emit("log",LOG_PREFIX + "SAY\t" +  to + "\t" + text);
	client.say(unescape(to),unescape(text));
});
var client = new irc.Client(config.irc.server,config.irc.nick, {debug:config.irc.debug,realName:config.irc.realName});
client.on("registered", function(m) {
	stream.emit("irc.registered",m);
});
client.on("motd", function(m) {
	stream.emit("irc.motd",m);
});
client.on("names", function(channel,nicks) {
	stream.emit("irc.names",channel,nicks);
});
client.on("topic", function(channel,topic,nick,message) {
	stream.emit("irc.topic",channel,topic,nick,message);
});
client.on("join", function(channel,nick,message) {
	stream.emit("irc.join",channel,nick,message);
});
client.on("part", function(channel,nick,reason,message) {
	stream.emit("irc.part",channel,nick,reason,message);
});
client.on("quit", function(nick,reason,channels,message) {
	stream.emit("irc.quit",nick,reason,channels,message);
});
client.on("kick", function(channel,nick,by,reason,message) {
	stream.emit("irc.kick",channel,nick,by,reason,message);
});
client.on("message", function(nick,to,text,message) {
	stream.emit("irc.message",nick,to,text,message);
});
client.on("notice",function (nick, to, text, message) {
	stream.emit("log",LOG_PREFIX + "NOTICE:\t" + unescape(text));
	stream.emit("irc.notice",nick,to,text,message);
});
client.on("pm",function (nick, text, message) {
	stream.emit("irc.pm",nick,text,message);
});
client.on("nick",function (oldnick,newnick,channels,message) {
	stream.emit("irc.nick",oldnick,newnick,channels,message);
});
client.on("raw",function(message){
	stream.emit("irc.raw",message);
});
client.on("error",function(e) {
	stream.emit("log",LOG_PREFIX + e.command);
});

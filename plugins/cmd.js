var myirc2 = require("../includes/myirc2-helper.js");
var config = myirc2.config;
var stream = myirc2.getStream();
var readline = require("readline");
var LOG_PREFIX = "plugins/cmd.js:\t\t";
stream.emit("log",LOG_PREFIX + "Starting");
var rl = readline.createInterface(process.stdin,process.stdout,null,true);
rl.setPrompt("# ", 2);
rl.prompt();
rl.on("line",function(line) {
	if(line.trim().match(/^exit$/i) != null) {
		process.exit(0);
	}
	var parts = line.split(/\s+/);
	var cmd = parts[0];
	if(cmd == "client.say") {
		stream.emit(parts[0],parts[1],parts.splice(2).join(" "));
	} else if(cmd == "log") {
		stream.emit(parts[0],LOG_PREFIX+parts.splice(1).join(" "));
	} else {
		stream.emit(parts[0],parts.splice(1).join(" "));
	}
	
	rl.prompt();
	//stream.output.emit("admin",escape(line));
});

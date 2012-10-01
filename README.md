# Ben Paretzky's IRC Bot

Aims to be a easy to use, reliable, and close to the metal IRC bot.  For now, targeting the freenode.net irc network.

### Features
* Authentication with NickServ (plugins/auth.js)
* Command line access to all functionality (plugins/cmd.js)
  * Client commands to interact with irc
    * client.say #channel message
    * client.join #channel
* Goo.gl link unshortening (plugins/googl.js)
* Logging (plugins/logging.js)
  *  Backed by sqlite3
  *  Logs all messages in the channels you're in
  *  @rand user - Will return a random quote by user in the current channel
* Qalculate Interface (plugins/qalc.js)
  * @calc expression - Will return Qalculates output for expression
* Regular Expressions (plugins/regex.js)
  * Independent of other logging, will monitor the last thing said in a channel to apply for the command below:
  * s/findExp/replaceString - Will globally replace findExp using a native Javascript RegExp expression with replaceString.
* Leave messages for when someone joins or becomes active in a channel. (plugins/tell.js)
  * Back by sqlite3
  * @tell user message - Will repeat your message to user when they next join or say something in the current channel.
* Vimeo link previews (plugins/vimeo.js)
* Youtube link previews (plugins/youtube.js)

### Plugin Management 

Plugins are all run in their own processes.  Currently to stop a plugin you'll want to send a SIGINT (ctrl+c) or SIGKILL kill -9.  

By design everything will just unhook from the main process and reconnect once you restart.  Make sure you're currently in /PATH/TO/paretzky-node-ircbot/ as your present working directory.  Run node plugins/name.js for each plugin to restart.

To see what plugins are running, you have two options.  Check the main myirc2.js log to see what was started.  Or just run ps and grep for the children of node myirc2.js.

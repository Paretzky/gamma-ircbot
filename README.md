# Ben Paretzky's IRC Bot

Aims to be a easy to use, reliable, and close to the metal IRC bot.  For now, targeting the freenode.net irc network.

## Features
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

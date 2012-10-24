## node-ircbot

Aims to be a easy to use, reliable, and close to the metal IRC bot.  For now, targeting the freenode.net irc network.

### Notes about running paretzky-node-irc
* Currently this is only tested on fc1{6,7}.x64
* plugins/qalc.js depends on Qalculate and "qalc" being in your path

### Features
* Authentication with NickServ (plugins/auth.js)
* Command line access to all functionality (plugins/cmd.js)
  * Client commands to interact with irc
    * client.say #channel message
    * client.join #channel
    * client.part #channel
* Goo.gl link unshortening (plugins/googl.js)
* Logging (plugins/logging.js)
  *  Backed by sqlite3
  *  Logs all messages in the channels you're in
  *  @rand user - Will return a random quote by user in the current channel
* Qalculate Interface (plugins/qalc.js)
  * @calc \[args\] expression - Will return Qalculates output for expression.
    * args are options passed to qalculate taking the form \[:digit:\]+\w
    * If duplicates are found, the last will be used.  ex.  2b16b10b will use base-10
    *  b|B for Base, defaults to 10 
      *  ex. 2b for binary
    *  p|P for Precision, defaults to 8
      * ex. 4p 1/3 = 0.3333
    * Examples:
      * @calc pi  --  Will return pi using the default precision
      * @calc 200p pi -- Will return pi to 200 digits
      * @calc 2b 3 -- Will return 11
      * @calc 16b5p 1/3 -- Will return 0x0.5555
  * For additional details see <http://qalculate.sourceforge.net/>
  * Qalculate supports the following currencies ATS BEF DEM eurocents € FIM FRF GRD IEP ITL LUF PTE ESP
  * The manual for Qalculate can be found at <http://qalculate.sourceforge.net/gtk-manual/index.html>
* Regular Expressions (plugins/regex.js)
  * Independent of other logging, will monitor the last thing said in a channel to apply for the command below:
  * s/findExp/replaceString - Will globally replace findExp using a native Javascript RegExp expression with replaceString.
* Leave messages for when someone joins or becomes active in a channel. (plugins/tell.js)
  * Backed by sqlite3
  * @tell user message - Will repeat your message to user when they next join or say something in the current channel.
* Vimeo link previews (plugins/vimeo.js)
* Youtube link previews (plugins/youtube.js)
* Wikipedia lookups
  * @wiki search terms - Will give a link give a brief except and link to the specified article
* Nice
  * Will respond "Hai $NICK =D" to /(ha?i)|(hello)|(h(e|a)y)/i
  * Will respond "Thanks $NICK" to /wb.?\s/i, as in Welcome Back
* Finger
  * BETA - @finger user - Will look up user on the SUNY Oswego Computer Science Dept. user account system.
  * More info about the finger(1) command can be found at <http://linux.die.net/man/1/finger>
* People Search
  * BETA - @people name - Will look up name with the SUNY Oswego People search HTTP interface.  Currently works for no results, and one result.  Results with more than one answer and not yet supported.

### Plugin Management 

Plugins are all run in their own processes.  Currently to stop a plugin you'll want to send a SIGINT (ctrl+c) or SIGKILL kill -9.  

By design everything will just unhook from the main process and reconnect once you restart.  Make sure you're currently in /PATH/TO/paretzky-node-ircbot/ as your present working directory.  Run node plugins/name.js for each plugin to restart.

To see what plugins are running, you have two options.  Check the main myirc2.js log to see what was started.  Or just run ps and grep for the children of node myirc2.js.

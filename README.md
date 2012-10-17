## node-ircbot

Aims to be a easy to use, reliable, and close to the metal IRC bot.  For now, targeting the freenode.net irc network.

### Notes about running paretzky-node-irc
* You'll have to remove irchelper.pipe after each run of myirc2.js.  It is the main communication channel between the plugins and various parts of this program and must not exist when first running myirc2.js.
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
  * @calc (PRECISION) expression - Will return Qalculates output for expression.  (PRECISION) is an optional arguement taking the form /\d+(p|P)/, for which the p is removed and the remaining number is passed to qalculate as the precision.
    * Examples:
      * @calc pi  --  Will return pi using qalculate's default precision
      * @calc 200p pi -- Will return pi to 200 digits
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

### Plugin Management 

Plugins are all run in their own processes.  Currently to stop a plugin you'll want to send a SIGINT (ctrl+c) or SIGKILL kill -9.  

By design everything will just unhook from the main process and reconnect once you restart.  Make sure you're currently in /PATH/TO/paretzky-node-ircbot/ as your present working directory.  Run node plugins/name.js for each plugin to restart.

To see what plugins are running, you have two options.  Check the main myirc2.js log to see what was started.  Or just run ps and grep for the children of node myirc2.js.
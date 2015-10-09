var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	refresh = require('./modules/refresh'),
	chokidar = require('chokidar'),
	exec = require('child_process').exec,
	app = express(),
	connections = [],
	// 2886 = AUTO
	port = 2886,
	child,
	command,
	watchfiles,
	queuedEvents = {},

	// Ref: http://davidwalsh.name/javascript-debounce-function
	debounce = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	},
	debounceAmount = 100,
	runCommand = debounce(function(command, callback){
		child = exec(command, 					// command line argument directly in string
			function (error, stdout, stderr) {	// one easy function to capture data/errors
				if (error !== null) {
					console.log('exec error: ' + error);
				}
				if(stdout) {
					console.log('stdout: ' + stdout);
				}
				if(stderr) {
					console.log('stderr: ' + stderr);
				}
				callback();
			}
		);
	}, debounceAmount);


//	We parse application/x-www-form-urlencoded and application/json
//	Note: this also fixes issues with WS being closed too soon.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//	Allow all domains
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	return next();
});

//	Static directory for our client-side JS
app.use(express.static(path.join(__dirname, '/public')));

command = process.argv[2];
watchfiles = process.argv.slice(3);

if(!command || !watchfiles.length) {
	console.log("Autorefresh usage:");
	console.log();
	console.log("	autorefresh [command] [files...]");
	console.log();
	console.log("Where [command] is the command to execute when one of the [files] change");
	process.exit(1);
}

//	Grab arguments, ignores .dotfiles
chokidar.watch(watchfiles, {ignored: /[\/\\]\./}).on('all', function(event, path) {
	var i, hasPath;
	if(event == "change") {
		if(!queuedEvents[path]) {
			queuedEvents[path] = path;
			runCommand(command, function(){
				//	Need to be able to send a messge to the connected users.
				//	
				for(i = 0; i < connections.length; i += 1) {
					connections[i].write(JSON.stringify({
						url: path
					}));
				}
				delete queuedEvents[path];
			});
		}
	}
});

//	Run the server
var server = app.listen(port, function () {
	connections = refresh(server, app);
	console.log("Autorefresh listening", port);
	app.set("AUTOREFRESHREADY", true);
});
#!/usr/bin/env node
var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	refresh = require('./modules/refresh'),
	chokidar = require('chokidar'),
	exec = require('child_process').exec,
	parseArgs = require('minimist'),
	options,
	app = express(),
	connections = [],
	// 2886 = AUTO
	defaultPort = 2886,
	child,
	watchfiles,
	queuedEvents = {},
	print = function() {
		if(!options.q) {
			console.log.apply(console, arguments);
		}
	},

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

		//	make the current directory where we're the script from
		var cmdPath = path.parse(command),
			cwd = path.resolve(cmdPath.dir),
			base = cmdPath.base,
			cmd = path.resolve(command);

		child = exec(cmd,
			{
				cwd: cwd,
			},
			function (error, stdout, stderr) {
				if (error !== null) {
					print('exec error: ' + error);
				}
				if(stdout) {
					print('stdout: ' + stdout);
				}
				if(stderr) {
					print('stderr: ' + stderr);
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

options = parseArgs(process.argv.slice(2));

command = process.argv[2];
watchfiles = options._;

if(!options.c || !watchfiles.length) {
	console.log("Autorefresh usage:");
	console.log();
	console.log("	autorefresh -c [command] -p [port] [files]");
	console.log();
	console.log("Where:");
	console.log("	-c [command] is the command to execute when one of the [files] change");
	console.log("	-p [port] (optional) is the port to run on, defaults to 2886");
	console.log("	-q [boolean] (optional), if we want to be quiet and not output anything");
	console.log();
	console.log("For example:");
	console.log();
	console.log("	autorefresh ./compile.sh style.less");
	console.log();
	console.log("Will run the ./compile.sh file every time style.less changes, and then refresh all styles in files that include refresh.js");
	console.log();
	process.exit(1);
}

options.p = options.p || defaultPort;

//	Grab arguments, ignores .dotfiles
chokidar.watch(watchfiles, {ignored: /[\/\\]\./}).on('all', function(event, filePath) {
	var i, hasPath;
	if(event == "change") {
		if(!queuedEvents[filePath]) {
			queuedEvents[filePath] = filePath;

			print(filePath, "changed");

			runCommand(options.c, function(){
				//	Need to be able to send a messge to the connected users.
				//	
				for(i = 0; i < connections.length; i += 1) {
					connections[i].write(JSON.stringify({
						url: filePath
					}));
				}
				delete queuedEvents[filePath];
			});
		}
	}
});

//	Run the server
var server = app.listen(options.p, function () {
	connections = refresh(server, app, options.q);
	print("Autorefresh listening on:", options.p);
	app.set("AUTOREFRESHREADY", true);
});

//	Explain what EADDRINUSE means
server.on("error", function(problem){
	print();
	if(problem.code == "EADDRINUSE") {
		print("Port %s is already in use - if you want to run multiple instances of autorefresh, please specify the port with '-p [port]' where [port] is a number", options.p);
	} else {
		print("ERROR", arguments);
	}
	print();
	process.exit(1);
});
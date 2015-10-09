var sockjs = require('sockjs');

module.exports = function refresh (server, app, quiet) {
	//	Watch for ready value, or timeout
	var maxWait = 30000,
		print = function() {
			if(!quiet) {
				console.log.apply(console, arguments);
			}
		},
		interTime = 50,
		count = 0,
		connections = [],
		inter = setInterval(function(){
			if(app.get("AUTOREFRESHREADY") || count >= (maxWait/interTime)) {
				clearInterval(inter);
				var refresher = sockjs.createServer({
					log: function(){
						//print(arguments);
					}
				});
				refresher.on('connection', function(conn){
					connections.push(conn);
					print("Connected", connections.length);
					conn.on('close', function(){
						var i;
						for(i = 0; i < connections.length; i += 1) {
							if(connections[i] == conn) {
								print('Remove connection', i);
								connections.splice(i, 1);
							}
						}
					});
				});
				refresher.installHandlers(server, {prefix: '/autorefresh'});
			}
			count += 1;
		}, interTime);
	return connections;
};
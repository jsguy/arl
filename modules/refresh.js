var sockjs = require('sockjs');

module.exports = function refresh (server, app) {
	//	Watch for ready value, or timeout
	var maxWait = 30000,
		interTime = 50,
		count = 0,
		connections = [],
		inter = setInterval(function(){
			if(app.get("AUTOREFRESHREADY") || count >= (maxWait/interTime)) {
				clearInterval(inter);
				var refresher = sockjs.createServer({
					log: function(){
						//console.log(arguments);
					}
				});
				refresher.on('connection', function(conn){
					connections.push(conn);
					console.log("Connected", connections.length);
					conn.on('close', function(){
						var i;
						for(i = 0; i < connections.length; i += 1) {
							if(connections[i] == conn) {
								console.log('Remove connection', i);
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
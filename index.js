require('newrelic');
// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var users = [];

io.on('connection', function (socket) {

    console.log('id: '+socket.id);
    socket.emit('connected', {
	userid: socket.id,
	existedUsers: users
    });

    socket.on('login', function(data) {
	users.push(data);
	socket.broadcast.emit('login', data);
    });

    socket.on('position', function(data) {
	io.sockets.emit('position', {
	    userid: socket.id,
	    position: data
	});
    });

    socket.on('clicked', function(data) {
	io.sockets.emit('clicked', {
	    userid: socket.id
	});
    });

    socket.on('disconnect', function () {
	users.forEach(function(element, index, array) {
	    if(element.userid == socket.id){
		array.splice(index, 1);
	    }
	});
	
	io.sockets.emit('logout', {
	    userid: socket.id,
	});
    });
});

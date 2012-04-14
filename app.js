
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer(),
    io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var queue = [];
var rooms = {}

// Socket
io.sockets.on('connection', function (socket) {
  socket.emit('newMessage', 'hi!');
  socket.on('newMessage', function (message) {
    if (rooms[socket.id] !== undefined) { 
      io.sockets.in(rooms[socket.id]).emit('newMessage', message);
    }
  });

  socket.on('status', function (message) {
    if (message === 'wait') {
      socket.emit('newMessage', 'Wait...');
      queue.push(socket.id);
      console.log(queue);

      if (queue.length >= 2) {
        var id1 = queue.shift();
        var id2 = queue.shift();
        var roomId = id1 + '-' + id2
        rooms[id1] = roomId;
        rooms[id2] = roomId;
        io.sockets.socket(id1).emit('status', 'match');
        io.sockets.socket(id2).emit('status', 'match');
        io.sockets.socket(id1).join(roomId);
        io.sockets.socket(id2).join(roomId);
      }
    }
  });

  socket.on('disconnect', function () {
    delete rooms[socket.id];
  });
});

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

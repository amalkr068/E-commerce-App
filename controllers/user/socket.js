// socket.js
//const socketIo = require('socket.io');
//const { app } = require("../../app");  // Keep app.js import here, but only for server

//const server = require('http').Server(app); // Create HTTP server from Express app
//const io = socketIo(app);  // Initialize socket.io with the HTTP server

//module.exports = { io };



// socket.js
//const socketIo = require('socket.io');
//const http = require('http');

// Initialize the server by importing it from app.js
//const { app } = require('../../app');  // Import Express app here
//const server = http.createServer(app); // Create the HTTP server from app

// Initialize Socket.IO with the HTTP server
//const io = socketIo(server);

//module.exports = { io, server };














// controllers/user/socket.js
const socketIo = require('socket.io');

// Create Socket.IO instance by attaching it to the HTTP server
const io = socketIo();  // Initialize socket.io without passing the app directly

module.exports = { io };


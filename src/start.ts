// using require because npm sucks with typings
const express = require('express');
//import * as socketio from 'socket.io';
import { Server } from 'http';
import { Room } from './server/room';

const app = express();
const server = new Server(app);

// Static files
app.use('/client', express.static(__dirname + '/client'));
app.get('/', (req :any, res :any) => {
  res.sendFile(__dirname + '/client/index.html');
});

const room = new Room();
room.open(27001);

server.listen(8080);
console.log('Serving on port 8080');

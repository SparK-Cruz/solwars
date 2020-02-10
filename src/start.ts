// using require because npm sucks with typings
const express = require('express');
import { Server } from 'http';
import { Room } from './server/room';
import { Config } from './space/config';

const app = express();
const server = new Server(app);

// Static files
app.use('/client', express.static(__dirname + '/client'));
app.get('/', (req :any, res :any) => {
  res.sendFile(__dirname + '/client/index.html');
});

const STATIC_PORT = 8080;
const ROOM_PORT = 27001;

Config.read();

const room = new Room();
room.open(ROOM_PORT);

server.listen(STATIC_PORT);
console.log('Serving on port '+STATIC_PORT);

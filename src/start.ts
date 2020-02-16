// using require because npm sucks with typings
const express = require('express');
import { Server } from 'http';
import { Room } from './server/room';
import { Config } from './space/config';

const app = express();
const server = new Server(app);

// Static files
app.use('/', express.static(__dirname + '/client'));

Config.read(() => {
  const STATIC_PORT = Config.clientPort;
  const ROOM_PORT = Config.serverPort;

  const room = new Room();
  room.open(ROOM_PORT);

  server.listen(STATIC_PORT);
  console.log('Serving on port '+STATIC_PORT);
});

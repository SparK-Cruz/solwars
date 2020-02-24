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

  const port = process.env.PORT || STATIC_PORT;

  const room = new Room(server);
  server.listen(port);
  room.open();

  console.log('Serving on port '+port);
});

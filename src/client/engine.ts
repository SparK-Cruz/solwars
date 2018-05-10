import { Stage, TPS } from '../space/stage';
import { Ship } from '../space/entities/ship';
import { Model as ShipModel } from '../space/entities/ships/model';
import { Input } from './input';
import { Camera } from './camera';
import { Renderer } from './renderer';

import * as socketio from 'socket.io-client';
import { CodecFacade } from '../space/codec_facade';

// HTML setup
const debug = <HTMLDivElement> document.getElementById('debug');
const canvas = <HTMLCanvasElement> document.getElementById('canvas');

document.body.style.overflow = 'hidden';
canvas.style.height = window.innerHeight + 'px';
canvas.style.width = window.innerWidth + 'px';

const aspect = window.innerWidth / window.innerHeight;
canvas.width = aspect * canvas.height;

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// Game setup
const stage = new Stage();
// setInterval(function(){
//   stage.step();
// }, 1000/TPS);

// Player and Controls setup
const ship = new Ship(ShipModel.Warbird);
ship.color = 'rgb('
  + Math.round(Math.random()*255)+','
  + Math.round(Math.random()*255)+','
  + Math.round(Math.random()*255)+')';

ship.decals[0].name = 'decal' + Math.round(Math.random());
ship.decals[0].color = 'rgb('
  + Math.round(Math.random()*255)+','
  + Math.round(Math.random()*255)+','
  + Math.round(Math.random()*255)+')';

new Input(ship.control);
let name = 'Anon' + (100 + Math.round(Math.random() * 899));


// Network setup
let codec = new CodecFacade(stage);
let conn = socketio(':27001');
console.log('joining by '+name);
conn.emit('join', {name: name, ship: ship});


conn.on('accepted', (data :any) => {
  console.log('Accepted with '+data);
  ship.memId = data;
  stage.add(ship);
});
conn.on('step', (data :any) => {
  // ignore until we have acceptance confirmation
  // otherwise we will get two ships for each player
  // one with and other without memId and then a
  // memId conflict depending on a race condition
  // betwen the two events
  if (!ship.memId) {
    console.log('Not on yet');
    return;
  }

  codec.writeState(data);
});

let lastInput = 0;
setInterval(function(){
  const input = ship.control.getState();
  if (lastInput === input)
    return;

  conn.emit('input', input);
  lastInput = input;
}, 1000/TPS);

// Graphics setup
const camera = new Camera(ship, center);
const renderer = new Renderer(canvas, camera, stage);

const tracked = camera.getTrackable();
let lastTick = Date.now();

setInterval(function() {
  let fps = Math.round(1000 / (Date.now() - lastTick));
  lastTick = Date.now();

  let pos = {
    x: globalPos(tracked.x),
    y: globalPos(tracked.y)
  };

  debug.innerHTML = '<pre>SECTOR: ' + pos.x + pos.y + ' ' + fps + '</pre>';

  if (fps < 55) {
    // frame skip
    return;
  }

  renderer.render();
}, 1000/60);

function globalPos(number :number) {
  let signal = (number < 0) ? 'L' : 'H';
  let hex = padLeft(Math.abs(number / (Stage.SECTOR_SIZE / Stage.SUBDIVISIONS) | 0).toString(16).toUpperCase(), 4);
  return signal + hex;
}
function padLeft(number :string, length :number) :string {
  while(number.length < length) {
    number = '0' + number;
  }
  return number;
}

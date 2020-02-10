import { Stage } from '../space/stage';
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
let remoteId :number = null;

// Player and Controls setup
let input = new Input();
let name = 'Anon' + (100 + Math.round(Math.random() * 899));

// Graphics setup
const camera = new Camera({x: 0, y: 0, vx: 0, vy: 0}, center);
const renderer = new Renderer(canvas, camera, stage);

let lastTick = Date.now();
let shipModel = 'spec';

function renderFrame() {
  const fps = Math.round(1000 / (Date.now() - lastTick));
  lastTick = Date.now();

  const pos = {
    x: globalPos(camera.trackable.x),
    y: globalPos(camera.trackable.y)
  };

  const speed = Math.sqrt(Math.pow((<Ship>camera.trackable).vx, 2) + Math.pow((<Ship>camera.trackable).vy, 2));

  debug.innerHTML = [
    'SECTOR: ',
    'H',
    pos.x,
    'V',
    pos.y,
    ' ',
    fps,
    '<br/>ENERGY: ',
    (<any>camera.trackable).health - (<any>camera.trackable).damage,
    "<br/>CONTROL: ",
    (<any>camera.trackable).control,
    "<br/>SPEED: ",
    speed,
    "<br/>",
    shipModel
  ].join('');

  if (fps > 55) {
    renderer.render();

    // if (!stage.dumbMode) {
    //   const camPos = camera.getPosition();
    //   dbg.clearRect(0, 0, debugCollisions.width, debugCollisions.height);
    //   dbg.save();
    //   dbg.translate(-camPos.x, -camPos.y);
    //   dbg.beginPath();
    //   dbg.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    //   stage.collisionSystem.draw(dbg);
    //   dbg.closePath();
    //   dbg.stroke();
    //   dbg.restore();
    // }
  }

  requestAnimationFrame(renderFrame);
};
renderFrame();

function globalPos(number :number) {
  let signal = (number < 0) ? 'M' : 'P';
  let hex = padLeft(Math.abs(number / 125 | 0).toString(16).toUpperCase(), 4);
  return signal + hex;
}
function padLeft(number :string, length :number) :string {
  while(number.length < length) {
    number = '0' + number;
  }
  return number;
}

// Network setup
let codec = new CodecFacade(stage);
let conn = socketio(':27001');
console.log('joining by '+name);
conn.emit('join', {name: name});

conn.on('accept', (data :any) => {
  console.log('Accepted with '+data.id);
  remoteId = data.id;
  stage.add(data.ship);
  camera.trackable = data.ship;

  const name = data.ship.model[0].toUpperCase() + data.ship.model.substr(1);
  const model = (<any>ShipModel)[name];
  shipModel = model.make + ' ' + model.name;

  input.change(state => {
    data.ship.control = state;
    conn.emit('input', state);
  });
});
conn.on('step', (data :any) => {
  // ignore until we have acceptance confirmation
  // otherwise we will get two ships for each player
  // one with and other without memId and then a
  // memId conflict depending on a race condition
  // betwen the two events
  if (!remoteId) {
    console.log('Not on yet');
    return;
  }

  codec.writeState(data);
});
conn.on('removal', (data :any) => {
  console.log(data);
  stage.remove(data);
});

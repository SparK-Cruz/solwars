import { Stage, TPS } from '../space/stage';
import { Ship } from '../space/entities/ship';
import { Model as ShipModel } from '../space/entities/ships/model';
import { Input } from './input';
import { Camera } from './camera';
import { Renderer } from './renderer';

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

const stage = new Stage();

const ship = new Ship(ShipModel.Warbird);
const secondship = new Ship(ShipModel.Warbird);
const thirdship = new Ship(ShipModel.Warbird);
secondship.x = 100;
secondship.y = 100;
secondship.angle = 180;

secondship.color = '#116600';
secondship.decals = [
  {name: 'decal0', color: '#003300'}
];

thirdship.color = '#3399ff';
thirdship.decals = [
  {name: 'decal1', color: '#ffffff'}
];

new Input(ship.control);
//new Input(secondship.control);

stage.add(ship);
stage.add(secondship);
stage.add(thirdship);

(<any>window).control = thirdship.control;

function follow(target :Ship) {
  var angle = Math.atan2(this.y - target.y, this.x - target.x) / Math.PI * 180 - 90;
  if (angle < 0) {
    angle += 360;
  }

  var diff = angle - this.angle;
  if (diff > 180) {
    diff -= 360;
  }
  if (diff < -180) {
    diff += 360;
  }

  this.control.thrust(true);
  this.control.turn(diff < -5, diff > 5);
}

const camera = new Camera(ship, center);
const renderer = new Renderer(canvas, camera, stage);

setInterval(function(){
  follow.call(secondship, ship);
  stage.step();
}, 1000/TPS);

const tracked = camera.getTrackable();
let lastTick = Date.now();

setInterval(function() {
  // if (!inFullScreen()){
  //   debug.innerHTML = '<pre>Please enter fullscreen mode by pressing F11 or cmd+shift+F</pre>';
  //   return;
  // }

  let fps = Math.round(1000 / (Date.now() - lastTick));
  lastTick = Date.now();

  let pos = {
    x: globalPos(tracked.x),
    y: globalPos(tracked.y)
  };

  debug.innerHTML = '<pre>SECTOR: ' + pos.x + pos.y + ' ' + fps + '</pre>';

  if (fps < 55) {
    return; // frame skipping
  }

  renderer.render();
}, 1000/60);

// function inFullScreen() {
//   return 5 > window.outerHeight - window.innerHeight;
// }

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

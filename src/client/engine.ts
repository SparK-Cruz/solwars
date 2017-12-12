import { Stage, TPS } from '../space/stage';
import { Ship } from '../space/entities/ship';
import { Input } from './input';
import { Camera } from './camera';
import { Renderer } from './renderer';

const debug = <HTMLDivElement> document.getElementById('debug');
const canvas = <HTMLCanvasElement> document.getElementById('canvas');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const ctx = canvas.getContext('2d');

const center = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

const stage = new Stage();

const ship = new Ship();
ship.model = 'warbird';
const secondship = new Ship();
secondship.x = 150;
secondship.y = 200;
secondship.angle = 165;

new Input(ship.control);

stage.add(ship);
stage.add(secondship);

const camera = new Camera(ship, center);
const renderer = new Renderer(canvas, camera, stage);

setInterval(function(){
  stage.step();
}, 1000/TPS);

let lastPos = {x: '', y: ''};
let lastTick = Date.now();
let lastFPS :number[] = [];
let sampleLimit = 120;
setInterval(function() {
  let camPos = camera.getPosition();

  renderer.render();

  // let pos = {
  //   x: globalPos(camPos.x + center.x),
  //   y: globalPos(camPos.y + center.y)
  // };
  let pos = {
    x: globalPos(ship.x),
    y: globalPos(ship.y)
  };

  //if (pos.x != lastPos.x || pos.y != lastPos.y) {
    let fps = Math.round((Date.now() - lastTick) * 60 / (1000/60));
    lastFPS.push(fps);

    if (lastFPS.length > sampleLimit) {
      lastFPS.shift();
    }

    let sumFPS = 0;
    lastFPS.forEach(function(value :number) {
      sumFPS += value;
    });
    let mediumFPS = Math.round(sumFPS / Math.min(lastFPS.length, sampleLimit));

    debug.innerHTML = '<pre>SECTOR: ' + pos.x + pos.y + ' ' + mediumFPS + '</pre>';
    lastTick = Date.now();
    lastPos = pos;
  //}
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

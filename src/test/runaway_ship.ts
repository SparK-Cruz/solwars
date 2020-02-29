import { Ship } from '../space/entities/ship';
import { Mapping } from '../space/entities/ships/mapping';
import { Model as ShipModel } from '../space/entities/ships/model';
import { Stage } from '../space/stage';
import { Config } from '../space/config';

const Collisions = require('collisions').Collisions;

Config.read(() => {
  const stage = new Stage(new Collisions());
  const ship = new Ship(ShipModel.Warbird);
  const mapping = new Mapping();

  stage.add(ship);

  const interval = setInterval(() => {
    stage.step(1);
  }, 0);

  setTimeout(() => {
    mapping.press(Mapping.FORWARD);
    ship.control = mapping.state;
    console.log(ship.x + ' ' + ship.y);
  }, 1000);

  setTimeout(() => {
    mapping.release(Mapping.FORWARD);
    ship.control = mapping.state;
    console.log(ship.x + ' ' + ship.y);
  }, 2000);

  setTimeout(() => {
    console.log(ship.x + ' ' + ship.y);
    clearInterval(interval);

    process.exit();
  }, 4000);
});

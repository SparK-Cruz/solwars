import { Ship } from '../space/entities/ship';
import { Stage, TPS } from '../space/stage';

(() => {

  let stage = new Stage();
  let ship = new Ship();

  stage.add(ship);

  setInterval(() => {
    stage.step();
  }, 1000 / TPS);

  setTimeout(() => {
    ship.control.thrust(true);
  }, 5000);

  setTimeout(() => {
    ship.control.thrust(false, false);
  }, 5500);
})();

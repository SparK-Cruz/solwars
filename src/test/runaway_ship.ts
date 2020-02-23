import { Ship } from '../space/entities/ship';
import { Mapping } from '../space/entities/ships/mapping';
import { Model as ShipModel } from '../space/entities/ships/model';
import { Stage } from '../space/stage';

(() => {

  const stage = new Stage();
  const ship = new Ship(ShipModel.Warbird);
  const mapping = new Mapping();

  stage.add(ship);

  setInterval(() => {
    stage.step(1);
  }, 1000 / 64);

  setTimeout(() => {
    mapping.press(Mapping.FORWARD);
    ship.control = mapping.state;
  }, 5000);

  setTimeout(() => {
    mapping.release(Mapping.FORWARD);
    ship.control = mapping.state;
  }, 5500);
})();

import { Mapping } from './mapping';
import { ShipControl } from '../space/entities/ship';

export class Input {
  control :ShipControl;
  mapping :Mapping = new Mapping();

  map :any = {
    'k87': Mapping.FORWARD,
    'k83': Mapping.BACKWARD,
    'k38': Mapping.FORWARD,
    'k40': Mapping.BACKWARD,
    'k37': Mapping.LEFT,
    'k39': Mapping.RIGHT,
    'k81': Mapping.SLIDE,
    'k65': Mapping.STRIFE_LEFT,
    'k68': Mapping.STRIFE_RIGHT
  };

  constructor(control :ShipControl) {
    this.control = control;

    window.addEventListener('keydown', (e :KeyboardEvent) => {
      this.keydown(e);
    });
    window.addEventListener('keyup', (e :KeyboardEvent) => {
      this.keyup(e);
    });
  }

  keydown(e :KeyboardEvent) :void {
    if (typeof this.map['k'+e.keyCode] == 'undefined')
      return;

    if (this.mapping.press(this.map['k'+e.keyCode]))
      this.updateControl(this.mapping.getState());
  }

  keyup(e :KeyboardEvent) :void {
    if (typeof this.map['k'+e.keyCode] == 'undefined')
      return;

    if (this.mapping.release(this.map['k'+e.keyCode]))
      this.updateControl(this.mapping.getState());
  }

  updateControl(state :number) {
    this.control.thrust(!!(state & Mapping.FORWARD), !!(state & Mapping.BACKWARD));
    this.control.strife(!!(state & Mapping.STRIFE_LEFT), !!(state & Mapping.STRIFE_RIGHT));
    this.control.turn(!!(state & Mapping.LEFT), !!(state & Mapping.RIGHT));
    this.control.slide(!!(state & Mapping.SLIDE));
  }
}

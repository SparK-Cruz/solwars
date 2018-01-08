import { Mapping } from '../space/entities/ships/mapping';
import { Control as ShipControl } from '../space/entities/ships/control';

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
    'k65': Mapping.STRIFE_LEFT,
    'k68': Mapping.STRIFE_RIGHT,
    'k17': Mapping.SHOOT,
    'k16': Mapping.RUN
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
    this.control.setState(state);
  }
}

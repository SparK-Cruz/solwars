import { Mapping } from '../space/entities/ships/mapping';

export class Input {
    private onChange = function(state :number) :void{};
    private mapping :Mapping = new Mapping();

    map :any = {
        'k38': Mapping.FORWARD, //Arrow up
        'k40': Mapping.BACKWARD, //Arrow down
        'k37': Mapping.LEFT, //Arrow left
        'k39': Mapping.RIGHT, //Arrow right
        'k69': Mapping.SHOOT, //E
        'k16': Mapping.AFTERBURNER, //SHIFT
        'k17': Mapping.SHOOT, //CTRL
        'k81': Mapping.AFTERBURNER, //Q
        'k65': Mapping.STRIFE_LEFT, //A
        'k68': Mapping.STRIFE_RIGHT, //D
    };

    public constructor(emmiter: any) {
        emmiter.addEventListener('keydown', (e :KeyboardEvent) => {
            this.keydown(e);
        });
        emmiter.addEventListener('keyup', (e :KeyboardEvent) => {
            this.keyup(e);
        });
    }

    public keydown(e :KeyboardEvent) :void {
        if (typeof this.map['k'+e.keyCode] == 'undefined')
            return;

        if (this.mapping.press(this.map['k'+e.keyCode]))
            this.updateControl(this.mapping.state);
    }

    public keyup(e :KeyboardEvent) :void {
        if (typeof this.map['k'+e.keyCode] == 'undefined')
            return;

        if (this.mapping.release(this.map['k'+e.keyCode]))
            this.updateControl(this.mapping.state);
    }

    public updateControl(state :number) {
        this.onChange(state);
    }

    public change(callback :(state :number) => void) {
        this.onChange = callback;
    }
}

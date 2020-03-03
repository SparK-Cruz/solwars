import { Mapping } from '../space/entities/ships/mapping';

export const DEFAULT_MAPPING = {
    'k38': Mapping.FORWARD, //Arrow up
    'k87': Mapping.FORWARD, //W
    'k40': Mapping.BACKWARD, //Arrow down
    'k83': Mapping.BACKWARD, //S
    'k37': Mapping.LEFT, //Arrow left
    'k65': Mapping.LEFT, //A
    'k39': Mapping.RIGHT, //Arrow right
    'k68': Mapping.RIGHT, //D
    'k81': Mapping.STRAFE_LEFT, //Q
    'k69': Mapping.STRAFE_RIGHT, //E
    'k32': Mapping.SHOOT, //SPACE BAR
    'k16': Mapping.AFTERBURNER, //SHIFT
};

export class Input {
    private onChange = function(state :number) :void{};
    protected mapping :Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    map :any = DEFAULT_MAPPING;

    public constructor(emmiter: any) {
        const keydown = (e :KeyboardEvent) => {
            this.keydown(e);
        };
        const keyup = (e :KeyboardEvent) => {
            this.keyup(e);
        };

        this.enabler = () => {
            if (this.disabler)
                return;

            if (localStorage.keyMapping) {
                this.map = JSON.parse(localStorage.keyMapping);
            }

            emmiter.addEventListener('keydown', keydown);
            emmiter.addEventListener('keyup', keyup);

            this.disabler = () => {
                emmiter.removeEventListener('keydown', keydown);
                emmiter.removeEventListener('keyup', keyup);
                this.disabler = null;
            };
        };
    }

    public enable() {
        this.enabler && this.enabler();
    }

    public disable() {
        this.disabler && this.disabler();
    }

    public keydown(e :KeyboardEvent) :void {
        if (typeof this.map['k'+e.which] == 'undefined')
            return;

        if (this.mapping.press(this.map['k'+e.which]))
            this.updateControl(this.mapping.state);
    }

    public keyup(e :KeyboardEvent) :void {
        if (typeof this.map['k'+e.which] == 'undefined')
            return;

        if (this.mapping.release(this.map['k'+e.which]))
            this.updateControl(this.mapping.state);
    }

    public updateControl(state :number) {
        this.onChange(state);
    }

    public change(callback :(state :number) => void) {
        this.onChange = callback;
    }
}

import { Mapping } from '../space/entities/ships/mapping';

export const DEFAULT_MAPPING = {
    'ArrowUp': Mapping.FORWARD, //Arrow up
    'KeyW': Mapping.FORWARD, //W
    'ArrowDown': Mapping.BACKWARD, //Arrow down
    'KeyS': Mapping.BACKWARD, //S
    'ArrowLeft': Mapping.LEFT, //Arrow left
    'KeyA': Mapping.LEFT, //A
    'ArrowRight': Mapping.RIGHT, //Arrow right
    'KeyD': Mapping.RIGHT, //D
    'KeyQ': Mapping.STRAFE_LEFT, //Q
    'KeyE': Mapping.STRAFE_RIGHT, //E
    'Space': Mapping.SHOOT, //SPACE BAR
    'ShiftLeft': Mapping.AFTERBURNER, //SHIFT
};

export class Input {
    private onChange = function (state: number): void { };
    protected mapping: Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    map: any = DEFAULT_MAPPING;

    public constructor(emmiter: any) {
        const keydown = (e: KeyboardEvent) => {
            this.keydown(e);
        };
        const keyup = (e: KeyboardEvent) => {
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

    public keydown(e: KeyboardEvent): void {
        if (typeof this.map[e.code] == 'undefined')
            return;

        if (this.mapping.press(this.map[e.code]))
            this.updateControl(this.mapping.state);
    }

    public keyup(e: KeyboardEvent): void {
        if (typeof this.map[e.code] == 'undefined')
            return;

        if (this.mapping.release(this.map[e.code]))
            this.updateControl(this.mapping.state);
    }

    public updateControl(state: number) {
        this.onChange(state);
    }

    public change(callback: (state: number) => void) {
        this.onChange = callback;
    }
}

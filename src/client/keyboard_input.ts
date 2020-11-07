import { Inputable } from './input';
import { Mapping } from '../space/entities/ships/mapping';
import InputStore from './input_store';

export class KeyboardInput implements Inputable {
    private onChange = function (state: number): void { };
    protected mapping: Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    private map: any = null;

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

            InputStore.load();
            this.map = InputStore.data.keyMapping;

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

    private keydown(e: KeyboardEvent): void {
        if (typeof this.map[e.code] == 'undefined')
            return;

        if (this.mapping.press(this.map[e.code]))
            this.updateControl(this.mapping.state);
    }

    private keyup(e: KeyboardEvent): void {
        if (typeof this.map[e.code] == 'undefined')
            return;

        if (this.mapping.release(this.map[e.code]))
            this.updateControl(this.mapping.state);
    }

    public change(callback: (state: number) => void) {
        this.onChange = callback;
    }

    private updateControl(state: number) {
        if (!this.disabler)
            return;

        this.onChange(state);
    }
}

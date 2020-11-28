import { Mapping } from '../space/entities/ships/mapping';
import { IS_MOBILE } from './environment';
import { Inputable } from './input';

export class MobileInput implements Inputable {
    private onChange = function (state: number): void { };
    protected mapping: Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    private map: any = {
        'up': Mapping.FORWARD,
        'right': Mapping.RIGHT,
        'down': Mapping.BACKWARD,
        'left': Mapping.LEFT,
        'afterburner': Mapping.AFTERBURNER,
        'shoot': Mapping.SHOOT,
    };

    constructor(emitter: any) {
        if (!IS_MOBILE) return;

        const press = (key: string) => {
            this.pressAll(key.split('-'));
        };
        const release = (key: string) => {
            this.releaseAll(key.split('-'));
        };

        this.enabler = () => {
            if (this.disabler)
                return;

            emitter.on('press', press);
            emitter.on('release', release);

            this.disabler = () => {
                emitter.removeListener('press', press);
                emitter.removeListener('release', release);
                this.disabler = null;
            };
        };
    }

    enable(): void {
        this.enabler && this.enabler();
    }
    disable(): void {
        this.disabler && this.disabler();
    }
    change(callback: (state: number) => void): void {
        this.onChange = callback;
    }

    private pressAll(list: string[]) {
        list.map(key => {
            return this.mapping.press(this.map[key]);
        }).reduce((a: boolean, b: boolean) => a || b, false)
            && this.updateControl(this.mapping.state);
    }

    private releaseAll(list: string[]) {
        list.map(key => {
            return this.mapping.release(this.map[key]);
        }).reduce((a: boolean, b: boolean) => a || b, false)
            && this.updateControl(this.mapping.state);
    }

    private updateControl(state: number) {
        if (!this.disabler)
            return;

        this.onChange(state);
    }
}

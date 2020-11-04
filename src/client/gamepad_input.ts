import { Inputable } from './input';
import { GamepadListener } from './gamepad_listener';
import { Mapping } from '../space/entities/ships/mapping';
import InputStore from './input_store';

InputStore.load();

export class GamepadInput implements Inputable {
    private gamepadListener: GamepadListener = null;
    private onChange = function (state: number): void { };
    protected mapping: Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    map: any = InputStore.data.padMapping;

    public constructor(emmiter: any) {
        this.gamepadListener = new GamepadListener(emmiter);

        this.enabler = () => {
            if (this.disabler)
                return;

            this.gamepadListener.enable();
            this.gamepadListener.on('axisMove', this.axisMove);
            this.gamepadListener.on('buttonChange', this.buttonChange);

            this.disabler = () => {
                this.gamepadListener.off('buttonChange', this.buttonChange);
                this.gamepadListener.off('axisMove', this.axisMove);
                this.gamepadListener.disable();
            };
        };
    }

    public enable() {
        this.enabler && this.enabler();
    }

    public disable() {
        this.disabler && this.disabler();
    }

    private buttonChange(pad: number, button: number, value: boolean): void {
        if (typeof this.map[pad].buttons[button] == 'undefined')
            return;

        if (this.mapping[value ? 'press' : 'release'](this.map[pad].buttons[button]))
            this.updateControl(this.mapping.state);
    }

    private axisMove(pad: number, axis: number, value: number): void {
        this.axisMoveHigh(pad, axis, value);
        this.axisMoveLow(pad, axis, value);
    }

    private axisMoveHigh(pad: number, axis: number, value: number): void {
        if (typeof this.map[pad].axes[axis].high == 'undefined')
            return;

        if (this.mapping[value > 0 ? 'press' : 'release'](this.map[pad].axes[axis].high))
            this.updateControl(this.mapping.state);
    }

    private axisMoveLow(pad: number, axis: number, value: number): void {
        if (typeof this.map[pad].axes[axis].low == 'undefined')
            return;

        if (this.mapping[value < 0 ? 'press' : 'release'](this.map[pad].axes[axis].low))
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

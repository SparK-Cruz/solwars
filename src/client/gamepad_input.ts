import { Inputable } from './input.js';
import { AxisInfo, ButtonInfo, GamepadListener } from './gamepad_listener.js';
import { Mapping } from '../space/entities/ships/mapping.js';
import InputStore from './input_store.js';

export class GamepadInput implements Inputable {
    private gamepadListener: GamepadListener = null;
    private onChange = function (state: number): void { };
    protected mapping: Mapping = new Mapping();

    private enabler: Function;
    private disabler: Function;

    private map: any = null;

    private axisMoveListener: any = null;
    private buttonChangeListener: any = null;

    public constructor(emmiter: any) {
        this.gamepadListener = GamepadListener.getInstance(emmiter);
        this.axisMoveListener = this.axisMove.bind(this);
        this.buttonChangeListener = this.buttonChange.bind(this);

        this.enabler = () => {
            if (this.disabler)
                return;

            this.map = InputStore.data.padMapping;

            this.gamepadListener.enable();
            this.gamepadListener.on('axisMove', this.axisMoveListener);
            this.gamepadListener.on('buttonChange', this.buttonChangeListener);

            this.disabler = () => {
                this.gamepadListener.removeListener('buttonChange', this.buttonChangeListener);
                this.gamepadListener.removeListener('axisMove', this.axisMoveListener);
                this.gamepadListener.disable();
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

    private buttonChange(info: ButtonInfo): void {
        if (typeof this.map[info.pad].buttons[info.button] == 'undefined')
            return;

        if (this.mapping[info.state ? 'press' : 'release'](this.map[info.pad].buttons[info.button]))
            this.updateControl(this.mapping.state);
    }

    private axisMove(info: AxisInfo): void {
        this.axisMoveHigh(info.pad, info.axis, info.state);
        this.axisMoveLow(info.pad, info.axis, info.state);
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

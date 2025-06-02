import { EventEmitter } from 'events';

const DEADZONE = 0.2;

export interface SimplePad {
    axes: number[],
    buttons: boolean[],
}
export interface AxisInfo {
    pad: number,
    axis: number,
    state: number,
}
export interface ButtonInfo {
    pad: number,
    button: number,
    state: boolean,
}

function translatePad(pad: Gamepad): SimplePad {
    return {
        axes: pad.axes.map(n => Math.abs(n) <= DEADZONE ? 0 : n),
        buttons: pad.buttons.map(b => !!Math.ceil(b.value)),
    };
}

let instance: GamepadListener = null;

export class GamepadListener extends EventEmitter {
    private last: SimplePad[] = [];

    private enabler: Function;
    private disabler: Function;

    private pads: Gamepad[] = [];

    private interval: any = null;

    public static getInstance(emitter: any) {
        if (!instance) instance = new GamepadListener(emitter);
        return instance;
    }

    private constructor(emmiter: any) {
        super();

        const changeCheck = () => {
            this.pads = navigator.getGamepads();
            if (typeof this.pads.forEach !== 'function') return;

            this.pads.forEach((pad, i) => {
                if (!pad) {
                    return;
                }

                const state = translatePad(pad);

                if (this.last[i]) {
                    const last = this.last[i];

                    for (let j in state.axes) {
                        if (state.axes[j] === last.axes[j])
                            continue;

                        this.emit('axisMove', <AxisInfo>{
                            pad: i,
                            axis: parseInt(j),
                            state: state.axes[j]
                        });
                    }

                    for (let j in state.buttons) {
                        if (state.buttons[j] === last.buttons[j])
                            continue;

                        this.emit('buttonChange', <ButtonInfo>{
                            pad: i,
                            button: parseInt(j),
                            state: state.buttons[j],
                        });
                    }
                }

                this.last[i] = state;
            });
        };

        this.enabler = () => {
            if (this.disabler)
                return;

            this.interval = setInterval(changeCheck, 1000 / 64);

            this.disabler = () => {
                this.disabler = null;
                clearInterval(this.interval);
            };
        };
    }

    public enable() {
        this.enabler && this.enabler();
    }

    public disable() {
        this.disabler && this.disabler();
    }
}

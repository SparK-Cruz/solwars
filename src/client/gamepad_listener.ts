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

export class GamepadListener extends EventEmitter {
    private last: SimplePad[] = [];

    private enabler: Function;
    private disabler: Function;

    private pads: Gamepad[] = [];

    private interval: any = null;

    public constructor(emmiter: any) {
        super();

        const changeCheck = () => {
            this.pads.forEach((pad, i) => {
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

        const connect = () => {
            this.pads = navigator.getGamepads();

            if (this.interval)
                return;

            this.interval = setInterval(changeCheck, 1000 / 64);
        };
        const disconnect = () => {
            this.pads = navigator.getGamepads();

            if (this.pads.length == 0) {
                clearInterval(this.interval);
            }
        };

        this.enabler = () => {
            if (this.disabler)
                return;

            emmiter.addEventListener('gamepadconnected', connect);
            emmiter.addEventListener('gamepaddisconnected', disconnect);

            this.disabler = () => {
                emmiter.removeEventListener('gamepadconnected', connect);
                emmiter.removeEventListener('gamepaddisconnected', disconnect);
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
}

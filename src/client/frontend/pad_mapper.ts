import { AxisInfo, ButtonInfo } from "../gamepad_listener";

export function readAxis(key: string) {
    const axis = key.match(/^(\d+)axis(\d+)(high|low)$/i);

    if (axis.length === 0) {
        return [];
    }

    axis.shift();

    return [
        parseInt(axis[0]),
        parseInt(axis[1]),
        (axis[2] === 'high') ? 1 : 0,
    ];
}
export function readButton(key: string) {
    const button = key.match(/^(\d+)btn(\d+)/i);

    if (button.length === 0) {
        return;
    }

    return [
        parseInt(button[0]),
        parseInt(button[1]),
    ];
}

export function writeAxis(info: AxisInfo) {
    return info.pad + 'axis' + info.axis + (info.state >= 0 ? 'high' : 'low');
}
export function writeButton(info: ButtonInfo) {
    return info.pad + 'btn' + info.button;
}

export class PadMapper {
    public constructor(private mapping: any) { }

    public toggle(key: string, action: number) {
        let info;
        if (info = readAxis(key)) {
            return this.toggleAxis.apply(this, [].concat(info).concat([action]));
        }
        info = readButton(key);
        this.toggleButton.apply(this, [].concat(info).concat([action]));
    }

    public map(key: string, action: number) {
        let info;
        if (info = readAxis(key)) {
            return this.mapAxis.apply(this, [].concat(info).concat([action]));
        }
        info = readButton(key);
        this.mapButton.apply(this, [].concat(info).concat([action]));
    }

    public unmap(key: string) {
        let info;
        if (info = readAxis(key)) {
            return this.unmapAxis.apply(this, [].concat(info));
        }
        info = readButton(key);
        this.unmapButton.apply(this, [].concat(info));
    }

    public toggleButton(pad: number, button: number, action: number) {
        if (this.mapping[pad].buttons[button] === action) {
            this.unmapButton(pad, button);
        }

        this.mapButton(pad, button, action);
    }

    public mapButton(pad: number, button: number, action: number) {
        this.mapping[pad].buttons[button] = action;
    }

    public unmapButton(pad: number, button: number) {
        this.mapping[pad].buttons[button] = null;
    }

    public toggleAxis(pad: number, axis: number, high: boolean, action: number) {
        if (this.mapping[pad].axes[axis][high ? 'high' : 'low'] === action) {
            this.unmapAxis(pad, axis, high);
            return;
        }

        this.mapAxis(pad, axis, high, action);
    }

    public mapAxis(pad: number, axis: number, high: boolean, action: number) {
        this.mapping[pad].axes[axis][high ? 'high' : 'low'] = action;
    }

    public unmapAxis(pad: number, axis: number, high: boolean) {
        this.mapping[pad].axes[axis][high ? 'high' : 'low'] = null;
    }
}

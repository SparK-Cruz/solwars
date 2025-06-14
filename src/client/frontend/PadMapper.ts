import { AxisInfo, ButtonInfo } from "../gamepad_listener.js";

export function readAxis(key: string): [number, number, boolean] | null {
    const axis = key.match(/^(\d+)axis(\d+)(high|low)$/i);

    if (null === axis) {
        return null;
    }

    axis.shift();

    return [
        parseInt(axis[0]),
        parseInt(axis[1]),
        (axis[2] === 'high'),
    ];
}
export function readButton(key: string): [number, number] | null {
    const button = key.match(/^(\d+)btn(\d+)/i);

    if (null === button) {
        return null;
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
            return this.toggleAxis(...info, action);
        }
        if (info = readButton(key)) {
            return this.toggleButton(...info, action);
        }
    }

    public map(key: string, action: number) {
        let info;
        if (info = readAxis(key)) {
            return this.mapAxis(...info, action);
        }
        if (info = readButton(key)) {
            return this.mapButton(...info, action);
        }
    }

    public unmap(key: string) {
        let info;
        if (info = readAxis(key)) {
            return this.unmapAxis(...info);
        }
        if (info = readButton(key)) {
            return this.unmapButton(...info);
        }
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

import { Mapping } from '../space/entities/ships/mapping.js';
import { writeAxis, writeButton, readAxis, readButton } from './frontend/PadMapper.js';

interface Action {
    code: number;
    name: string;
    keys: string[];
};

const DEFAULT_KEYS = {
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

const DEFAULT_PAD = [{
    buttons: [
        Mapping.AFTERBURNER,
        null,
        Mapping.SHOOT,
        null,
        Mapping.STRAFE_LEFT,
        Mapping.STRAFE_RIGHT,
        Mapping.AFTERBURNER,
        Mapping.SHOOT,
        null,
        null,
        null,
        Mapping.AFTERBURNER,
    ],
    axes: [
        { low: Mapping.LEFT, high: Mapping.RIGHT },
        { low: Mapping.FORWARD, high: Mapping.BACKWARD },
        { low: Mapping.STRAFE_LEFT, high: Mapping.STRAFE_RIGHT },
        { low: Mapping.FORWARD, high: Mapping.BACKWARD },
        { low: Mapping.LEFT, high: Mapping.RIGHT },
        { low: Mapping.FORWARD, high: Mapping.BACKWARD },
    ],
}];

const parse = (s: string | null, defaultValue: any): any => {
    if (!s) return defaultValue;

    try {
        const result = JSON.parse(s);
        if (!result || Object.values(result).length == 0)
            return defaultValue;

        return result;
    }
    catch (error) {
        return defaultValue;
    }
};

const titleCase = (name: string): string => {
    return name.toLowerCase().split('_').map((w: string) => w.split('').map((l, i) => i == 0 ? l.toUpperCase() : l).join('')).join(' ');
}

const serializeKeyboardMapping = (mapping: Action[]): any => {
    return mapping
        .map(a => a.keys.reduce(
            (o: any, k: string) => o[k] = a.code, {}
        ))
        .reduce(
            (o, b) => Object.assign(o, b), {}
        );
};
const serializeGamepadMapping = (mapping: Action[]): any => {
    const result: any[] = [];
    mapping.forEach(a => a.keys.map(s => {
        let info = null;
        if (info = readAxis(s)) {
            result[info[0]].axes = result[info[0]].axes || Array(6).fill(null);
            result[info[0]].axes[info[1]] = result[info[0]].axes[info[1]] || { high: null, low: null };
            result[info[0]].axes[info[1]][info[2] ? 'high' : 'low'] = a.code;
            return;
        }
        if (info = readButton(s)) {
            result[info[0]].buttons = result[info[0]].buttons || Array(12).fill(null);
            result[info[0]].buttons[info[1]] = a.code;
        }
    }));

    return result;
};

const deserializeKeyboardMapping = (obj: any): Action[] => {
    const result: Action[] = [];
    for (let action in Mapping) {
        const keys: string[] = [];

        for (let key in obj) {
            if (obj[key] !== (<any>Mapping)[action]) {
                continue;
            }

            keys.push(key);
        }

        result.push({
            code: (<any>Mapping)[action],
            name: titleCase(action),
            keys,
        });
    }

    return Object.values(result);
};

const deserializeGamepadMapping = (obj: any): Action[] => {
    const result: Action[] = [];
    for (let action in Mapping) {
        const keys: string[] = [];

        for (let i in obj) {
            for (let j in obj[i].axes) {
                if (obj[i].axes[j].high === (<any>Mapping)[action])
                    keys.push(writeAxis({
                        pad: parseInt(i),
                        axis: parseInt(j),
                        state: 1,
                    }));

                if (obj[i].axes[j].low === (<any>Mapping)[action])
                    keys.push(writeAxis({
                        pad: parseInt(i),
                        axis: parseInt(j),
                        state: -1,
                    }));
            }
            for (let j in obj[i].buttons) {
                if (obj[i].buttons[j] === (<any>Mapping)[action]) {
                    keys.push(writeButton({
                        pad: parseInt(i),
                        button: parseInt(j),
                        state: true,
                    }));
                }
            }
        }

        result.push({
            code: (<any>Mapping)[action],
            name: titleCase(action),
            keys,
        });
    }

    return Object.values(result);
};

export default {
    data: {
        keyMapping: <any>{},
        padMapping: [],
    },
    load() {
        this.data.keyMapping = parse(localStorage.getItem('keyMapping'), DEFAULT_KEYS);
        this.data.padMapping = parse(localStorage.getItem('padMapping'), DEFAULT_PAD);
    },
    save() {
        localStorage.setItem('keyMapping', JSON.stringify(this.data.keyMapping));
        localStorage.setItem('padMapping', JSON.stringify(this.data.padMapping));
    },
    export() {
        return {
            keyMapping: deserializeKeyboardMapping(this.data.keyMapping),
            padMapping: deserializeGamepadMapping(this.data.padMapping),
        };
    },
    import(mappings: {
        keyMapping: Action[],
        padMapping: Action[],
    }) {
        this.data.keyMapping = serializeKeyboardMapping(mappings.keyMapping);
        this.data.padMapping = serializeGamepadMapping(mappings.padMapping);
    },
    restoreDefaultKeyboard() {
        localStorage.removeItem('keyMapping');
        this.load();
        this.save();
    },
    restoreDefaultGamepad() {
        localStorage.removeItem('padMapping');
        this.load();
        this.save();
    },
    isKeyboardDefault(): boolean {
        if (Object.values(this.data.keyMapping).length !== Object.values(DEFAULT_KEYS).length)
            return false;

        for (const action in this.data.keyMapping) {
            if (!DEFAULT_KEYS.hasOwnProperty(action)
                || (<any>DEFAULT_KEYS)[action] !== <any>this.data.keyMapping[action])
                return false;
        }

        return true;
    },
    isGamepadDefault(): boolean {
        return JSON.stringify(this.data.padMapping) === JSON.stringify(DEFAULT_PAD);
    },
}

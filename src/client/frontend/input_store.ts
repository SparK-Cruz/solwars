import { Mapping } from '../../space/entities/ships/mapping';

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
const DEFAULT_PAD = {};

const parse = (s: string, defaultValue: any): any => {
    try {
        return JSON.parse(s) || defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const titleCase = (name: string): string => {
    return name.toLowerCase().split('_').map((w: string) => w.split('').map((l, i) => i == 0 ? l.toUpperCase() : l).join('')).join(' ');
}

const serializeMapping = (mapping: Action[]): string => {
    return mapping
        .map(a => a.keys.reduce(
            (o: any, k: string) => o[k] = a.code, {}
        ))
        .reduce(
            (o, b) => Object.assign(o, b), {}
        );
};

const deserializeMapping = (obj: any): Action[] => {
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

export default {
    data: {
        keyMapping: <any>{},
        padMapping: <any>{},
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
            keyMapping: deserializeMapping(this.data.keyMapping),
            padMapping: deserializeMapping(this.data.padMapping),
        };
    },
    import(mappings: {
        keyMapping: Action[],
        padMapping: Action[],
    }) {
        this.data.keyMapping = serializeMapping(mappings.keyMapping);
        this.data.padMapping = serializeMapping(mappings.padMapping);
    },
    restoreDefaultKeyboard() {
        localStorage.removeItem('keyMapping');
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
    isPadDefault(): boolean {
        return true;
    },
}
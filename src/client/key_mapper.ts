import { Mapping } from '../space/entities/ships/mapping';
import { DEFAULT_MAPPING } from './input';

export interface Action {
    code: number,
    name: string,
    keys: string[],
};

export class KeyMapper {
    private mapping: any = Object.assign({}, DEFAULT_MAPPING);

    public constructor() {
        if (localStorage.keyMapping) {
            this.mapping = JSON.parse(localStorage.keyMapping);
        }

        this.unpack();
    }

    public get isDefault(): boolean {
        if (Object.values(this.mapping).length !== Object.values(DEFAULT_MAPPING).length)
            return false;

        for (const action in this.mapping) {
            if (!DEFAULT_MAPPING.hasOwnProperty(action)
                || (<any>DEFAULT_MAPPING)[action] !== <any>this.mapping[action])
                return false;
        }

        return true;
    }

    public restore() {
        this.mapping = Object.assign({}, DEFAULT_MAPPING);
    }

    public unpack() {
        const unpacked: any = {};
        for (let action in Mapping) {
            const value = (<any>Mapping)[action];

            const keys: string[] = [];
            for (let key in this.mapping) {
                if (this.mapping[key] !== value)
                    continue;

                keys.push(key);
            }

            unpacked[action] = {
                code: value,
                name: this.actionName(action),
                keys: keys,
            };
        }

        return unpacked;
    }

    public toggle(key: string, action: number) {
        if (this.mapping[key] === action) {
            this.unmap(key);
            return;
        }

        this.map(key, action);
    }

    public map(key: string, action: number) {
        this.mapping[key] = action;
    }

    public unmap(key: string) {
        delete this.mapping[key];
    }

    public pack() {
        localStorage.keyMapping = JSON.stringify(this.mapping);
    }

    private actionName(name: string) {
        return name.toLowerCase().split('_').map(w => w.split('').map((l, i) => i == 0 ? l.toUpperCase() : l).join('')).join(' ');
    }
}

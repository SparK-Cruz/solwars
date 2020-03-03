import { Mapping } from '../space/entities/ships/mapping';
import { DEFAULT_MAPPING } from './input';

export interface Action {
    code: number,
    name: string,
    keys: number[],
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
        if (Object.values(this.mapping).length !== Object.values(DEFAULT_MAPPING).length) {
            return false;
        }
        for (const action in this.mapping) {
            if (!DEFAULT_MAPPING.hasOwnProperty(action)) {
                return false;
            }
            if ((<any>DEFAULT_MAPPING)[action] !== <any>this.mapping[action]) {
                return false;
            }
        }

        return true;
    }

    public restore() {
        this.mapping = Object.assign({}, DEFAULT_MAPPING);
    }

    public unpack() {
        const unpacked: any = {};
        for(let action in Mapping) {
            const value = (<any>Mapping)[action];

            const keys: number[] = [];
            for(let key in this.mapping) {
                if (this.mapping[key] !== value)
                    continue;

                keys.push(parseInt(key.substr(1)));
            }

            unpacked[action] = {
                code: value,
                name: this.actionName(action),
                keys: keys,
            };
        }

        return unpacked;
    }

    public toggle(key: number, action: number) {
        if (this.mapping['k'+key] === action) {
            this.unmap(key);
            return;
        }

        this.map(key, action);
    }

    public map(key: number, action: number) {
        this.mapping['k'+key] = action;
    }

    public unmap(key: number) {
        delete this.mapping['k'+key];
    }

    public pack() {
        localStorage.keyMapping = JSON.stringify(this.mapping);
    }

    private actionName(name: string) {
        return name.toLowerCase().split('_').map(w => w.split('').map((l, i) => i==0?l.toUpperCase():l).join('')).join(' ');
    }
}

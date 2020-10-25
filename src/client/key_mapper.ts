export class KeyMapper {
    public constructor(private mapping: any) { }

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
}

import InputStore from "./input_store.js";

export interface Inputable {
    enable(): void;
    disable(): void;
    change(callback: (state: number) => void): void;
}

export class Input implements Inputable {
    private inputs: Inputable[];

    constructor(...inputs: Inputable[]) {
        this.inputs = inputs;
    }

    enable() {
        InputStore.load();
        this.inputs.forEach(input => input.enable());
    }
    disable() {
        this.inputs.forEach(input => input.disable());
    }
    change(callback: (state: number) => void) {
        this.inputs.forEach(input => input.change(callback));
    }
}

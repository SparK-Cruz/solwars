import { KeyMapper, Action } from "../key_mapper";

const keycodes = [
    { "id": 'Tab', "name": "Tab" },
    { "id": 'Enter', "name": "Enter" },
    { "id": 'ShiftLeft', "name": "Left Shift" },
    { "id": 'ShiftRight', "name": "Right Shift" },
    { "id": 'ControlLeft', "name": "Left Ctrl" },
    { "id": 'ControlRight', "name": "Right Ctrl" },
    { "id": 'AltLeft', "name": "Left Alt" },
    { "id": 'AltRight', "name": "Right Alt" },
    { "id": 'CapsLock', "name": "Caps Lock" },
    { "id": 'Escape', "name": "Esc" },
    { "id": 'Space', "name": "Space Bar" },
    { "id": 'PageUp', "name": "Page Up" },
    { "id": 'PageDown', "name": "Page Down" },
    { "id": 'End', "name": "End" },
    { "id": 'Home', "name": "Home" },
    { "id": 'ArrowLeft', "name": "←" },
    { "id": 'ArrowUp', "name": "↑" },
    { "id": 'ArrowRight', "name": "→" },
    { "id": 'ArrowDown', "name": "↓" },
    { "id": 'Insert', "name": "Insert" },
    { "id": 'Delete', "name": "Delete" },
    { "id": 'Digit0', "name": "0" },
    { "id": 'Digit1', "name": "1" },
    { "id": 'Digit2', "name": "2" },
    { "id": 'Digit3', "name": "3" },
    { "id": 'Digit4', "name": "4" },
    { "id": 'Digit5', "name": "5" },
    { "id": 'Digit6', "name": "6" },
    { "id": 'Digit7', "name": "7" },
    { "id": 'Digit8', "name": "8" },
    { "id": 'Digit9', "name": "9" },
    { "id": 'KeyA', "name": "A" },
    { "id": 'KeyB', "name": "B" },
    { "id": 'KeyC', "name": "C" },
    { "id": 'KeyD', "name": "D" },
    { "id": 'KeyE', "name": "E" },
    { "id": 'KeyF', "name": "F" },
    { "id": 'KeyG', "name": "G" },
    { "id": 'KeyH', "name": "H" },
    { "id": 'KeyI', "name": "I" },
    { "id": 'KeyJ', "name": "J" },
    { "id": 'KeyK', "name": "K" },
    { "id": 'KeyL', "name": "L" },
    { "id": 'KeyM', "name": "M" },
    { "id": 'KeyN', "name": "N" },
    { "id": 'KeyO', "name": "O" },
    { "id": 'KeyP', "name": "P" },
    { "id": 'KeyQ', "name": "Q" },
    { "id": 'KeyR', "name": "R" },
    { "id": 'KeyS', "name": "S" },
    { "id": 'KeyT', "name": "T" },
    { "id": 'KeyU', "name": "U" },
    { "id": 'KeyV', "name": "V" },
    { "id": 'KeyW', "name": "W" },
    { "id": 'KeyX', "name": "X" },
    { "id": 'KeyY', "name": "Y" },
    { "id": 'KeyZ', "name": "Z" },
    { "id": 'Numpad0', "name": "NumPad 0" },
    { "id": 'Numpad1', "name": "NumPad 1" },
    { "id": 'Numpad2', "name": "NumPad 2" },
    { "id": 'Numpad3', "name": "NumPad 3" },
    { "id": 'Numpad4', "name": "NumPad 4" },
    { "id": 'Numpad5', "name": "NumPad 5" },
    { "id": 'Numpad6', "name": "NumPad 6" },
    { "id": 'Numpad7', "name": "NumPad 7" },
    { "id": 'Numpad8', "name": "NumPad 8" },
    { "id": 'Numpad9', "name": "NumPad 9" },
    { "id": 'NumpadMultiply', "name": "NumPad *" },
    { "id": 'NumpadAdd', "name": "NumPad +" },
    { "id": 'NumpadSubtract', "name": "NumPad -" },
    { "id": 'NumpadDecimal', "name": "NumPad ." },
    { "id": 'NumpadDivide', "name": "NumPad /" },
    { "id": 'NumLock', "name": "Num Lock" },
    { "id": 'ScrollLock', "name": "Scroll Lock" },
    { "id": 'Semicolon', "name": ";" },
    { "id": 'Equals', "name": "=" },
    { "id": 'Comma', "name": "," },
    { "id": 'Minus', "name": "-" },
    { "id": 'Period', "name": "." },
    { "id": 'Slash', "name": "/" },
    { "id": 'Backquote', "name": "`" },
    { "id": 'BracketLeft', "name": "[" },
    { "id": 'Backslash', "name": "\\" },
    { "id": 'BracketRight', "name": "]" },
    { "id": 'Quote', "name": "'" }
];

const mapper = new KeyMapper();
function toggleBinding(e: KeyboardEvent) {
    e.preventDefault();
    const action = parseInt((<HTMLDivElement>(<HTMLInputElement>e.target).parentNode).getAttribute('data-id'));
    const key = e.code;
    mapper.toggle(key, action);

    this.drawForm();
}

export class KeysForm {
    private mapper: KeyMapper;
    private form: HTMLFieldSetElement;
    private template: string;
    private resetBtn: HTMLInputElement;

    public constructor() {
        this.mapper = mapper;
        this.form = <HTMLFieldSetElement>document.querySelector('#keys-form').firstElementChild;
        const template = <HTMLDivElement>this.form.firstElementChild;
        template.className = "action";

        this.template = template.outerHTML;
        this.form.removeChild(template);

        this.resetBtn = <HTMLInputElement>document.getElementById('reset-keys-btn');

        this.resetBtn.addEventListener('click', e => {
            e.preventDefault();
            this.mapper.restore();
            this.drawForm();
        });

        this.resetBtn.disabled = this.mapper.isDefault;

        this.drawForm();
    }

    public drawForm() {
        this.mapper.pack();
        this.resetBtn.disabled = this.mapper.isDefault;

        [].forEach.call(this.form.children, (e: HTMLDivElement) => {
            e.removeEventListener('keydown', toggleBinding.bind(this));
        });
        this.form.innerHTML = "";
        const unpacked = this.mapper.unpack();
        for (let binding in unpacked) {
            const action = unpacked[binding];
            const field = this.createField(action);
            this.form.appendChild(field);
        }
    }

    private createField(action: Action) {
        const container = document.createElement('div');
        container.style.display = "none";
        container.innerHTML = this.template;
        document.body.appendChild(container);
        const field = <HTMLDivElement>container.firstElementChild;
        document.body.removeChild(container);
        field.setAttribute('data-id', action.code.toString());

        field.querySelector('label.name').textContent = action.name;
        (<HTMLInputElement>field.querySelector('input.codes')).value = action.keys.join(',');
        (<HTMLInputElement>field.querySelector('input.keys')).value = action.keys.map(k => this.keyNames(k)).join(', ');

        field.addEventListener('keydown', toggleBinding.bind(this));

        return field;
    }

    private keyNames(code: string): string {
        for (let i in keycodes) {
            if (keycodes[i].id !== code)
                continue;

            return keycodes[i].name;
        };
        return code.toString();
    }
}

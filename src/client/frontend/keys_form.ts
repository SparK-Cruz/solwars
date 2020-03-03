import { KeyMapper, Action } from "../key_mapper";

const keycodes = [
    {"id":8,"name":"Backspace"},
    {"id":9,"name":"Tab"},
    {"id":13,"name":"Enter"},
    {"id":16,"name":"Shift"},
    {"id":17,"name":"Ctrl"},
    {"id":18,"name":"Alt"},
    {"id":19,"name":"Pause/Break"},
    {"id":20,"name":"Caps Lock"},
    {"id":27,"name":"Esc"},
    {"id":32,"name":"Space Bar"},
    {"id":33,"name":"Page Up"},
    {"id":34,"name":"Page Down"},
    {"id":35,"name":"End"},
    {"id":36,"name":"Home"},
    {"id":37,"name":"←"},
    {"id":38,"name":"↑"},
    {"id":39,"name":"→"},
    {"id":40,"name":"↓"},
    {"id":45,"name":"Insert"},
    {"id":46,"name":"Delete"},
    {"id":48,"name":"0"},
    {"id":49,"name":"1"},
    {"id":50,"name":"2"},
    {"id":51,"name":"3"},
    {"id":52,"name":"4"},
    {"id":53,"name":"5"},
    {"id":54,"name":"6"},
    {"id":55,"name":"7"},
    {"id":56,"name":"8"},
    {"id":57,"name":"9"},
    {"id":65,"name":"A"},
    {"id":66,"name":"B"},
    {"id":67,"name":"C"},
    {"id":68,"name":"D"},
    {"id":69,"name":"E"},
    {"id":70,"name":"F"},
    {"id":71,"name":"G"},
    {"id":72,"name":"H"},
    {"id":73,"name":"I"},
    {"id":74,"name":"J"},
    {"id":75,"name":"K"},
    {"id":76,"name":"L"},
    {"id":77,"name":"M"},
    {"id":78,"name":"N"},
    {"id":79,"name":"O"},
    {"id":80,"name":"P"},
    {"id":81,"name":"Q"},
    {"id":82,"name":"R"},
    {"id":83,"name":"S"},
    {"id":84,"name":"T"},
    {"id":85,"name":"U"},
    {"id":86,"name":"V"},
    {"id":87,"name":"W"},
    {"id":88,"name":"X"},
    {"id":89,"name":"Y"},
    {"id":90,"name":"Z"},
    {"id":91,"name":"Left WinKey"},
    {"id":92,"name":"Right WinKey"},
    {"id":93,"name":"Select"},
    {"id":96,"name":"NumPad 0"},
    {"id":97,"name":"NumPad 1"},
    {"id":98,"name":"NumPad 2"},
    {"id":99,"name":"NumPad 3"},
    {"id":100,"name":"NumPad 4"},
    {"id":101,"name":"NumPad 5"},
    {"id":102,"name":"NumPad 6"},
    {"id":103,"name":"NumPad 7"},
    {"id":104,"name":"NumPad 8"},
    {"id":105,"name":"NumPad 9"},
    {"id":106,"name":"NumPad *"},
    {"id":107,"name":"NumPad +"},
    {"id":109,"name":"NumPad -"},
    {"id":110,"name":"NumPad ."},
    {"id":111,"name":"NumPad /"},
    {"id":112,"name":"F1"},
    {"id":113,"name":"F2"},
    {"id":114,"name":"F3"},
    {"id":115,"name":"F4"},
    {"id":116,"name":"F5"},
    {"id":117,"name":"F6"},
    {"id":118,"name":"F7"},
    {"id":119,"name":"F8"},
    {"id":120,"name":"F9"},
    {"id":121,"name":"F10"},
    {"id":122,"name":"F11"},
    {"id":123,"name":"F12"},
    {"id":144,"name":"Num Lock"},
    {"id":145,"name":"Scroll Lock"},
    {"id":186,"name":";"},
    {"id":187,"name":"="},
    {"id":188,"name":","},
    {"id":189,"name":"-"},
    {"id":190,"name":"."},
    {"id":191,"name":"/"},
    {"id":192,"name":"`"},
    {"id":219,"name":"["},
    {"id":220,"name":"\\"},
    {"id":221,"name":"]"},
    {"id":222,"name":"'"}
];

const mapper = new KeyMapper();
function toggleBinding(e: KeyboardEvent) {
    e.preventDefault();
    const action = parseInt((<HTMLDivElement>this).getAttribute('data-id'));
    const key = e.which;
    mapper.toggle(key, action);

    KeysForm.drawForm();
}

export class KeysForm {
    private static mapper: KeyMapper;
    private static form: HTMLFieldSetElement;
    private static template: string;
    private static resetBtn: HTMLInputElement;

    public static bind() {
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

    public static drawForm() {
        this.mapper.pack();
        this.resetBtn.disabled = this.mapper.isDefault;

        [].forEach.call(this.form.children, (e: HTMLDivElement) => {
            e.removeEventListener('keydown', toggleBinding);
        });
        this.form.innerHTML = "";
        const unpacked = this.mapper.unpack();
        for(let binding in unpacked) {
            const action = unpacked[binding];
            const field = this.createField(action);
            this.form.appendChild(field);
        }
    }

    private static createField(action: Action) {
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

        field.addEventListener('keydown', toggleBinding);

        return field;
    }

    private static keyNames(code: number): string {
        for(let i in keycodes) {
            if (keycodes[i].id !== code)
                continue;

            return keycodes[i].name;
        };
        return code.toString();
    }
}

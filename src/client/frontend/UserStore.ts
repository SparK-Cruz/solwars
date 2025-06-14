import { Model } from "../../space/entities/ships/model.js";

const defaultName = 'Anon' + (100 + Math.round(Math.random() * 899));

const ships = Model.all.filter(s => !s.disabled);
const validStoredShip = () => (
    parseInt(localStorage.getItem('model') || '0') % ships.length
);

const prepareColor = (c: string) => (c.charAt(0) === '#' ? c : '');

export default {
    data: {
        name: "",
        defaultName: defaultName,
        shipIndex: -1,
        decalIndex: -1,
        primaryColor: "#000000",
        secondaryColor: "#000000",
    },
    load() {
        this.data.name = localStorage.getItem('name') || "";
        this.data.shipIndex = validStoredShip();
        this.data.primaryColor = localStorage.getItem('color') || 'default';
        this.data.secondaryColor = localStorage.getItem('decal') || 'default';
        this.data.decalIndex = parseInt(localStorage.getItem('decalIndex') ?? '0' ) || 0;
    },
    dump() {
        return {
            name: this.data.name || this.data.defaultName,
            model: Model.all[this.data.shipIndex].id,
            color: prepareColor(this.filterColor(this.data.primaryColor)),
            decal: prepareColor(this.filterColor(this.data.secondaryColor)),
            decalIndex: this.data.decalIndex,
        };
    },
    save() {
        localStorage.setItem('name', this.data.name || "");
        localStorage.setItem('model', this.data.shipIndex.toString());
        localStorage.setItem('color', prepareColor(this.data.primaryColor));
        localStorage.setItem('decal', prepareColor(this.data.secondaryColor));
        localStorage.setItem('decalIndex', this.data.decalIndex.toString());
    },
    filterColor(hexColor: string) {
        if (hexColor.charAt(0) !== '#')
            return 'default';

        const color = parseInt(hexColor.replace('#', '0x'), 16);
        const components = [(color >> 16) % 0x100, (color >> 8) % 0x100, color % 0x100];
        const minimum = 0x20;
        const ratio = (0xff - minimum) / 0xff;
        const pad = '000000';

        return '#' + (pad + components.map(c => ratio * c + minimum).reduce((a: number, c: number) => (a << 8) + (c | 0)).toString(16)).substr(-pad.length);
    },
};

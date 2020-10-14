import { Model } from "../../space/entities/ships/model";

const Vue = require('vue/dist/vue');

const defaultName = 'Anon' + (100 + Math.round(Math.random() * 899));

const ships = Model.all.filter(s => !s.disabled);
const validStoredShip = () => (
    parseInt(localStorage.getItem('model') || '0') % ships.length
);

const prepareColor = (c: string) => (c.charAt(0) === '#' ? c : '');

export default {
    data: {
        name: <string>null,
        defaultName: defaultName,
        shipIndex: <number>null,
        primaryColor: <string>null,
        secondaryColor: <string>null,
    },
    load() {
        this.data.name = localStorage.getItem('name');
        this.data.shipIndex = validStoredShip();
        this.data.primaryColor = localStorage.getItem('color') || 'default';
        this.data.secondaryColor = localStorage.getItem('decal') || 'default';
    },
    dump() {
        return {
            name: this.data.name || this.data.defaultName,
            model: Model.all[this.data.shipIndex].id,
            color: prepareColor(this.filterColor(this.data.primaryColor)),
            decal: prepareColor(this.filterColor(this.data.secondaryColor)),
        };
    },
    save() {
        localStorage.setItem('name', this.data.name);
        localStorage.setItem('model', this.data.shipIndex.toString());
        localStorage.setItem('color', prepareColor(this.data.primaryColor));
        localStorage.setItem('decal', prepareColor(this.data.secondaryColor));
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

const PIXI = require('pixi.js');

import { defineComponent } from 'vue';
import { Ship } from '../../space/entities/ship';
import { Model } from '../../space/entities/ships/model';
import { AssetManager, Assets } from '../assets';
import { ShipRenderer } from '../game_renderers/entities/ship_renderer';
import ColorInput from './color_input';
import UserStore from './user_store';

const container: any = new PIXI.Container();
container.position.set(32);

const assman = AssetManager.getInstance();
const shipSingleton = new Ship(Model.all[0]);

export default defineComponent({
    name: 'ShipRender',
    template: `
        <div id="ship-render">
            <div class="container">
                <canvas v-show="rendered" ref="canvas" width="64" height="64" />
            </div>
            <div class="colors">
                <ColorInput :color="colors.primary" :default="defaults.primary" @change="changePrimary" />
                <ColorInput :color="colors.secondary" :default="defaults.secondary" @change="changeSecondary" />
            </div>
        </div>
    `,
    components: {
        ColorInput,
    },
    props: [
        'ship',
        'decal',
    ],
    data: () => ({
        shipInstance: shipSingleton,
        renderer: <any>null,
        colors: {
            primary: 'default',
            secondary: 'default',
        },
        defaults: {
            primary: '#000000',
            secondary: '#000000',
        },
        rendered: false,
    }),
    created() {
        this.colors.primary = UserStore.data.primaryColor;
        this.colors.secondary = UserStore.data.secondaryColor;
        this.shipInstance.collisionMap = [];

        this.$nextTick(() => {
            this.renderer = new PIXI.Application({
                resolution: 1,
                width: 64,
                height: 64,
                view: this.$refs.canvas
            });
            this.renderer.stage.addChild(container);

            this.render();
        });
    },
    methods: {
        render() {
            if (assman.preload()) {
                assman.once('load', () => {
                    this.render();
                });
                return;
            }
            this.rendered = true;

            this.shipInstance.model = this.ship.id;
            this.shipInstance.color = this.ship.color;
            this.defaults.primary = this.ship.color;
            this.shipInstance.decals[0].color = this.ship.decals[0].color;
            this.shipInstance.decals[0].name = this.ship.decals[0].name;
            this.defaults.secondary = this.ship.decals[0].color;

            if (this.colors.primary.charAt(0) == '#')
                this.shipInstance.color = UserStore.filterColor(this.colors.primary);

            if (this.colors.secondary.charAt(0) == '#')
                this.shipInstance.decals[0].color = UserStore.filterColor(this.colors.secondary);

            container.removeChildren();
            new ShipRenderer(container, this.shipInstance);
            this.renderer.render();
        },
        changePrimary(color: string) {
            UserStore.data.primaryColor = color;
            this.colors.primary = color;
            this.render();
        },
        changeSecondary(color: string) {
            UserStore.data.secondaryColor = color;
            this.colors.secondary = color;
            this.render();
        },
    },
    watch: {
        ship() {
            this.render();
        },
        decal() {
            this.render();
        }
    },
});

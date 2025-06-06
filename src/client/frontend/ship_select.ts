import { Model } from '../../space/entities/ships/model';
import ShipStats from './ship_stats';
import ShipInfo from './ship_info';
import ShipRender from './ship_render';
import PageIndicator from './page_indicator';
import UserStore from './user_store';

const MAX_DECALS = 3;

const ships = Model.all.filter(s => !s.disabled);
const stats: number[][] = [
    [0.5, 0.5, 0.25, 0.5],
    [0.4, 0.7, 0.25, 0.6],
    [0.6, 0.4, 0.5, 0.5],
    [0.7, 0.3, 0.75, 0.3],
    [0.6, 0.5, 0.5, 0.4],
    [0.5, 0.5, 0.5, 0.5],
];

const Vue = require('vue/dist/vue');

interface StatsData {
    energy: number,
    engines: number,
    weapons: number,
    handling: number,
}
interface Data {
    ship: Model,
    stats: StatsData,
    index: number,
    decalIndex: number,
}

export default Vue.extend({
    name: 'ShipSelect',
    template: `
        <div id="ship-select">
            <div class="buttons">
                <div class="prev button" @click="prev">Prev Ship</div>
                <div class="next button" @click="next">Next Ship</div>
            </div>
            <PageIndicator :index="index" :total="totalShips" @switch="jumpTo" />
            <div class="decal buttons">
                <div class="prev button" @click="prevDecal">Prev Decal</div>
                <div class="next button" @click="nextDecal">Next Decal</div>
            </div>
            <ShipRender :ship="ship" :decal="decalIndex" />
            <ShipInfo :ship="ship" />
            <ShipStats :stats="stats" />
        </div>
    `,
    components: {
        ShipRender,
        ShipStats,
        ShipInfo,
        PageIndicator,
    },
    data: () => (<Data>{
        index: 0,
        decalIndex: 0,
        ship: ships[0],
        stats: <StatsData>{
            energy: 0,
            engines: 0,
            weapons: 0,
            handling: 0,
        },
    }),
    created() {
        this.index = UserStore.data.shipIndex;
        this.decalIndex = UserStore.data.decalIndex;
        this.loadCurrentShip();
    },
    methods: {
        next() {
            const vm = <any>this;
            vm.index++;
            vm.loadCurrentShip();
        },
        prev() {
            const vm = <any>this;
            vm.index--;
            vm.loadCurrentShip();
        },
        jumpTo(number: number) {
            const vm = <any>this;
            vm.index = number;
            vm.loadCurrentShip();
        },
        nextDecal() {
            const vm = <any>this;
            vm.decalIndex = (vm.decalIndex + MAX_DECALS + 1) % MAX_DECALS;
            vm.loadCurrentShip();
        },
        prevDecal() {
            const vm = <any>this;
            vm.decalIndex = (vm.decalIndex + MAX_DECALS - 1) % MAX_DECALS;
            vm.loadCurrentShip();
        },
        loadCurrentShip() {
            const vm = <Data>this;

            vm.index = (vm.index + ships.length) % ships.length;
            vm.ship = ships[vm.index];

            vm.ship.decals[0].name = `decal${vm.decalIndex}`;

            const numbers = stats[vm.index || 0];
            Object.assign(vm.stats, <StatsData>{
                energy: numbers[0],
                engines: numbers[1],
                weapons: numbers[2],
                handling: numbers[3],
            });
            UserStore.data.shipIndex = vm.index;
            UserStore.data.decalIndex = vm.decalIndex;
        },
    },
    computed: {
        totalShips() {
            return ships.length;
        }
    }
});

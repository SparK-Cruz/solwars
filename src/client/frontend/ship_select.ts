import { Model } from '../../space/entities/ships/model';
import ShipStats from './ship_stats';
import ShipInfo from './ship_info';
import ShipRender from './ship_render';
import PageIndicator from './page_indicator';
import UserStore from './user_store';

const ships = Model.all.filter(s => !s.disabled);
const stats: number[][] = [
    [0.5, 0.5, 0.25, 0.5],
    [0.4, 0.7, 0.25, 0.6],
    [0.6, 0.4, 0.5, 0.5],
    [0.7, 0.3, 0.75, 0.3],
    [0.6, 0.5, 0.5, 0.4],
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
            <ShipRender :ship="ship" />
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
        loadCurrentShip() {
            const vm = <Data>this;

            if (vm.index < 0)
                vm.index = ships.length - 1;

            if (vm.index >= ships.length)
                vm.index = 0;

            vm.ship = ships[vm.index];

            const numbers = stats[vm.index || 0];
            Object.assign(vm.stats, <StatsData>{
                energy: numbers[0],
                engines: numbers[1],
                weapons: numbers[2],
                handling: numbers[3],
            });
            UserStore.data.shipIndex = vm.index;
        },
    },
    computed: {
        totalShips() {
            return ships.length;
        }
    }
});

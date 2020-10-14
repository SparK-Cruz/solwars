const Vue = require('vue/dist/vue');

import ShipStatIndicator from './ship_stat_indicator';

export default Vue.extend({
    name: 'ShipStats',
    template: `
        <div id="stats">
            <ShipStatIndicator :perc="stats.energy" label="Energy" />
            <ShipStatIndicator :perc="stats.engines" label="Engines" />
            <ShipStatIndicator :perc="stats.weapons" label="Weapons" />
            <ShipStatIndicator :perc="stats.handling" label="Handling" />
        </div>
    `,
    components: {
        ShipStatIndicator,
    },
    props: ['stats'],
});

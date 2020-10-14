const Vue = require('vue/dist/vue');

export default Vue.extend({
    name: 'ShipStatIndicator',
    template: `
        <div class="stat input">
            <div class="bar"><div class="fill" :style="{width: perc * 100 + '%' }"></div></div>
            <label>{{label}}</label>
        </div>
    `,
    props: ['perc', 'label'],
});

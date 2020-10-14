const Vue = require('vue/dist/vue');

export default Vue.extend({
    name: 'ShipInfo',
    template: `
        <div id="info">
            <p class="ship-name input"><span>{{ship.id}}</span></p>
            <p class="ship-make input"><span>{{ship.make}}</span><label>Make</label></p>
            <p class="ship-model input"><span>{{ship.name}}</span><label>Model</label></p>
            <p class="ship-description input"><span>{{ship.description}}</span></p>
        </div>
    `,
    props: ['ship'],
});

import { defineComponent } from "vue";

export default defineComponent({
    name: 'ShipStatIndicator',
    template: `
        <div class="stat input">
            <div class="bar"><div class="fill" :style="{width: perc * 100 + '%' }"></div></div>
            <label>{{label}}</label>
        </div>
    `,
    props: ['perc', 'label'],
});

const Vue = require('vue/dist/vue');

export default Vue.extend({
    name: 'PageIndicator',
    template: `
        <div class="page-indicator">
            <div v-for="n in numbers" :class="{active: n === index, bullet: true }" @click="tellOn(n)" />
        </div>
    `,
    props: ['index', 'total'],
    computed: {
        numbers() {
            return Array.apply(null, Array(this.total)).map((_: any, i: number) => i);
        }
    },
    methods: {
        tellOn(number: number) {
            this.$emit('switch', number);
        }
    }
});

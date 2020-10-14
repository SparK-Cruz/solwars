const Vue = require('vue/dist/vue');
import Layout from './frontend/layout';

const binder = {
    isGameRunning: false,
};

const app = new Vue({
    el: '#app',
    template: `
        <Layout v-if="!binder.isGameRunning" />
    `,
    components: { Layout },
    data: {
        binder
    }
});

window.addEventListener('gamestart', () => {
    binder.isGameRunning = true;
});

window.addEventListener('gamestop', () => {
    binder.isGameRunning = false;
});

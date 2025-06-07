import { createApp } from 'vue';
import Layout from './frontend/layout';

const binder = {
    isGameRunning: false,
};

createApp({
    template: `
        <Layout v-if="!binder.isGameRunning" />
    `,
    components: { Layout },
    data: () => ({binder}),
}).mount('#app');

window.addEventListener('gamestart', () => {
    binder.isGameRunning = true;
});

window.addEventListener('gamestop', () => {
    binder.isGameRunning = false;
});

const Vue = require('vue/dist/vue');

import JoinForm from './join_form';

export default Vue.extend({
    name: 'Layout',
    template: `
        <section id="layout">
            <header><h1><span>SubSpace</span>Sol Wars</h1></header>
            <JoinForm />
        </section>
    `,
    components: {
        JoinForm,
    },
});

// todo:
// * create input select component
// * create key bind input component
// * add joypad support
// * ???
// * profit

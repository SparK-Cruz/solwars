const Vue = require('vue/dist/vue');
import KeyboardEditor from './keyboard_editor';

export default Vue.extend({
    name: 'InputEditor',
    template: `
        <section id="input-editor">
            <div v-if="false" class="buttons">
                <div @click="tab = 0" class="button input">Keyboard</div>
                <div @click="tab = 1" class="button input">Gamepad</div>
            </div>
            <div v-if="tab == 0" ref="keyboard" class="controls"><KeyboardEditor /></div>
            <div v-if="tab == 1" ref="gamepad" class="controls">pads</div>
        </section>
    `,
    components: {
        KeyboardEditor,
    },
    data: () => ({
        tab: 0,
    }),
});

const Vue = require('vue/dist/vue');
import GamepadActionInput from './gamepad_action_input';
import InputStore from '../input_store';

export default Vue.extend({
    name: 'GamepadEditor',
    template: `
        <section id="gamepad-editor">
            <GamepadActionInput v-for="action in actions" :key="action.name" :action="action" @change="refresh" />
            <div class="buttons">
                <div class="button" @click="restore" :class="{disabled: isDefault}">Restore Defaults</div>
            </div>
        </section>
    `,
    components: {
        GamepadActionInput,
    },
    created() {
        InputStore.load();
        this.$nextTick(() => {
            this.refresh();
        });
    },
    data: () => ({
        actions: <any>[],
        isDefault: true,
    }),
    methods: {
        refresh() {
            InputStore.save();
            this.actions = InputStore.export().padMapping;
            this.isDefault = InputStore.isGamepadDefault();
        },
        restore() {
            if (this.isDefault)
                return;

            InputStore.restoreDefaultGamepad();
            this.refresh();
        }
    }
});

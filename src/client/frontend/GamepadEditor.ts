import GamepadActionInput from './GamepadActionInput.js';
import InputStore from '../input_store.js';

export default {
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
};

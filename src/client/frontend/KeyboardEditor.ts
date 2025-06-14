import KeyboardActionInput from './KeyboardActionInput.js';
import InputStore from '../input_store.js';

export default {
    name: 'KeyboardEditor',
    template: `
        <section id="keyboard-editor">
            <KeyboardActionInput v-for="action in actions" :key="action.name" :action="action" @change="refresh" />
            <div class="buttons">
                <div class="button" @click="restore" :class="{disabled: isDefault}">Restore Defaults</div>
            </div>
        </section>
    `,
    components: {
        KeyboardActionInput,
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
            this.actions = InputStore.export().keyMapping;
            this.isDefault = InputStore.isKeyboardDefault();
        },
        restore() {
            if (this.isDefault)
                return;

            InputStore.restoreDefaultKeyboard();
            this.refresh();
        }
    }
};

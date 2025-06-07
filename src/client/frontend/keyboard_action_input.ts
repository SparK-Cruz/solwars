import { defineComponent } from 'vue';
import InputStore from '../input_store';
import KeyboardLabels from './keyboard_labels';
import { KeyMapper } from './key_mapper';

export default defineComponent({
    name: 'KeyboardActionInput',
    template: `
        <div class="controller-input input">
            <p class="tag-container" @click="listenAndBind">
                <span v-if="idle" @click.stop="remove(key)" class="tag" v-for="key in action.keys" :key="key">{{keyLabel(key)}}</span>
                <span v-if="idle">&nbsp;</span>
                <span v-if="!idle"><input @keydown.prevent="bindKey" ref="input" placeholder="WAITING FOR INPUT" /></span>
            </p>
            <label>{{ action.name }}</label>
        </div>
    `,
    data: () => ({
        idle: true,
        mapper: <any>null,
    }),
    created() {
        this.mapper = new KeyMapper(InputStore.data.keyMapping);
    },
    props: ['action'],
    methods: {
        listenAndBind() {
            this.idle = false;
            this.$nextTick(() => {
                this.$refs.input.focus();
            });
        },
        remove(key: string) {
            this.mapper.unmap(key);
            this.$emit('change');
        },
        bindKey(e: KeyboardEvent) {
            this.idle = true;
            this.mapper.map(e.code, this.action.code);
            this.$emit('change');
        },
        keyLabel(key: string) {
            const found = KeyboardLabels.filter(k => k.id == key);
            if (!found.length)
                return key;

            return found.pop().name;
        },
    },
});

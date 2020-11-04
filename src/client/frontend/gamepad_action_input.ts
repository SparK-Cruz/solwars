const Vue = require('vue/dist/vue');
import { AxisInfo, ButtonInfo, GamepadListener } from '../gamepad_listener';
import InputStore from '../input_store';
import GamepadLabels from './gamepad_labels';
import { PadMapper } from './pad_mapper';

export default Vue.extend({
    name: 'GamepadActionInput',
    template: `
        <div class="controller-input input">
            <p class="tag-container" @click="listenAndBind">
                <span v-if="idle" @click.stop="remove(key)" class="tag" v-for="key in action.keys" :key="key">{{keyLabel(key)}}</span>
                <span v-if="idle">&nbsp;</span>
                <span v-if="!idle"><input ref="input" placeholder="WAITING FOR INPUT" /></span>
            </p>
            <label>{{ action.name }}</label>
        </div>
    `,
    data: () => ({
        idle: true,
        mapper: <any>null,
        listener: <GamepadListener>null,
    }),
    created() {
        this.listener = new GamepadListener(window);
        this.mapper = new PadMapper(InputStore.data.padMapping);

        this.listener.on('axisMove', (info: AxisInfo) => {
            if (!info.state) return;

            this.bindKey(info.pad + 'axis' + info.axis + (info.state > 0 ? 'high' : 'low'));
        });

        this.listener.on('changeButton', (info: ButtonInfo) => {
            if (!info.state) return;

            this.bindKey(info.pad + 'btn' + info.button);
        });
    },
    props: ['action'],
    methods: {
        listenAndBind() {
            this.idle = false;
            this.$nextTick(() => {
                this.$refs.input.focus();
                this.listener.enable();
            });
        },
        remove(key: string) {
            this.mapper.unmap(key);
            this.$emit('change');
        },
        bindKey(key: string) {
            if (this.idle) return;

            this.idle = true;
            this.mapper.map(key, this.action.code);
            this.$emit('change');
        },
        keyLabel(key: string) {
            const found = GamepadLabels.filter(k => k.id.endsWith(key));
            if (!found.length)
                return key;

            return found.pop().name;
        },
    },
});

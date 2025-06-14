import { defineComponent } from 'vue';
import { AxisInfo, ButtonInfo, GamepadListener } from '../gamepad_listener.js';
import InputStore from '../input_store.js';
import GamepadLabels from './GamepadLabels.js';
import { PadMapper } from './PadMapper.js';

export default defineComponent({
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
        listener: <any>null,
        axisMoveListener: <any>null,
        changeButtonListener: <any>null,
    }),
    created() {
        this.listener = new GamepadListener(window);
        this.mapper = new PadMapper(InputStore.data.padMapping);

        this.axisMoveListener = this.axisMove.bind(this);
        this.changeButtonListener = this.changeButton.bind(this);
    },
    props: ['action'],
    methods: {
        axisMove(info: AxisInfo) {
            if (!info.state) return;

            this.bindKey(info.pad + 'axis' + info.axis + (info.state > 0 ? 'high' : 'low'));
        },
        changeButton(info: ButtonInfo) {
            if (!info.state) return;

            this.bindKey(info.pad + 'btn' + info.button);
        },
        listenAndBind() {
            this.idle = false;
            this.$nextTick(() => {
                (this.$refs.input as HTMLElement).focus();
                this.listener.enable();
                this.listener.on('axisMove', this.axisMoveListener);
                this.listener.on('changeButton', this.changeButtonListener);
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
            this.listener.removeListener('axisMove', this.axisMoveListener);
            this.listener.removeListener('changeButton', this.changeButtonListener);
            this.listener.disable();
            this.$emit('change');
        },
        keyLabel(key: string) {
            return GamepadLabels.find(k => key.endsWith(k.id))?.name || 'Invalid';
        },
    },
});

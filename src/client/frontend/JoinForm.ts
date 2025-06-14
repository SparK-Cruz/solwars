import UserStore from './UserStore.js';

const customEvent = (name: string, data: any) => {
    return Object.assign(new Event(name), { data });
}

export default {
    name: 'JoinForm',
    template: `
        <form @submit.prevent="submit" id="join-form">
            <div class="top-row">
                <div id="name" class="input">
                    <input ref="name" v-model="name" :placeholder="placeholder" />
                    <label>Name</label>
                </div>
                <div>
                    <div class="button" @click="toggleInputEditor" id="edit-input">Input</div>
                    <Modal ref="inputEditorModal" :position="editorModalPosition">
                        <div ref="editorContainer">
                            <InputEditor />
                        </div>
                    </Modal>
                </div>
            </div>
            <ShipSelect ref="shipSelect" />
            <button type="submit">JOIN GAME</button>
        </form>
    `,
    data: () => ({
        name: '',
        editorModalPosition: { x: 0, y: 0 },
    }),
    created() {
        UserStore.load();
        this.name = UserStore.data.name;
        this.$nextTick(() => { this.$refs.name.select(); });
    },
    methods: {
        submit() {
            this.$refs.name.blur();
            UserStore.data.name = this.name;
            UserStore.save();
            window.dispatchEvent(customEvent('joingame', UserStore.dump()));
        },
        toggleInputEditor() {
            Object.assign(this.editorModalPosition, { x: this.$el.offsetLeft, y: this.$el.offsetTop });
            this.$refs.inputEditorModal.open();
            this.$nextTick(() => {
                this.$refs.editorContainer.style.width = this.$el.offsetWidth + 'px';
            });
        }
    },
    computed: {
        placeholder() {
            return UserStore.data.defaultName;
        }
    }
};

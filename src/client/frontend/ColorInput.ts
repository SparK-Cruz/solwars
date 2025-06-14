import { defineComponent } from "vue";
import type Modal from "./Modal.js";

export default defineComponent({
    name: 'ColorInput',
    template: `
        <div class="color-input" :style="{ backgroundColor: safeColor }" @click="openPicker">
            <Modal ref="modal" anchor="bottom-left" :position="modalPosition">
                <ColorPicker :start="safeColor" @pick="change" />
            </Modal>
        </div>
    `,
    props: ['color', 'default'],
    data: () => ({
        modalPosition: { x: 0, y: 0 },
    }),
    computed: {
        safeColor() {
            if (this.color.charAt(0) !== '#')
                return this.default;

            return this.color;
        }
    },
    methods: {
        openPicker(e: MouseEvent) {
            Object.assign(this.modalPosition, { x: e.clientX + 50, y: e.clientY - 50 });
            (this.$refs.modal as typeof Modal).open();
        },
        change(color: string) {
            this.$emit('change', color);
            (this.$refs.modal as typeof Modal).close();
        }
    }
});

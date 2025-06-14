import { defineComponent } from "vue";

export default defineComponent({
    name: 'Modal',
    template: `
        <section v-if="isOpen" class="modal-container" @click.stop="close">
            <div ref="content" :style="{ top: (position.y + offset.y) + 'px', left: (position.x + offset.x) + 'px' }" class="content" @click.stop="">
                <div class="modal-x-button" @click.stop="close" />
                <slot></slot>
            </div>
        </section>
    `,
    props: ['position', 'anchor'],
    data: () => ({
        isOpen: false,
        offset: { x: 0, y: 0 },
    }),
    methods: {
        open() {
            this.isOpen = true;
            this.$nextTick(() => {
                if (!this.anchor)
                    return;

                this.offset.y = 0;
                this.offset.x = 0;

                if (~this.anchor.indexOf('bottom'))
                    this.offset.y = -(this.$refs.content as HTMLElement).offsetHeight;

                if (~this.anchor.indexOf('right'))
                    this.offset.x = -(this.$refs.content as HTMLElement).offsetWidth;
            });
        },
        close() {
            this.isOpen = false;
        }
    }
});

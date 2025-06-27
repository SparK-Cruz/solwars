import { defineComponent, ref } from "vue"

const isOpen = ref(false);
const joinFormClass = ref("");

export default defineComponent({
    template: `
        <section id="layout">
            <header><h1>SUBSPACE<span>SOL WARS</span></h1></header>
            <button :class="isOpen ? 'open play' : 'play'" @click="isOpen = !isOpen">PLAY</button>
            <JoinForm ref="join-form" :class="isOpen ? 'open' : ''" />
        </section>
    `,
    data: () => ({
        isOpen: false
    }),
    methods: {
        toggleOpen() {
            this.isOpen = !this.isOpen;
        }
    }
});

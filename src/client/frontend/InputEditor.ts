import { defineComponent } from "vue";

export default defineComponent({
    name: 'InputEditor',
    template: `
        <section id="input-editor">
            <div class="buttons">
                <div @click="tab = 0" class="button input">Keyboard</div>
                <div @click="tab = 1" class="button input">Gamepad</div>
            </div>
            <div v-if="tab == 0" ref="keyboard" class="controls"><KeyboardEditor /></div>
            <div v-if="tab == 1" ref="gamepad" class="controls"><GamepadEditor /></div>
        </section>
    `,
    data: () => ({
        tab: 0,
    }),
});

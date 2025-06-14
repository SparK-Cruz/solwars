import { createApp, ref } from 'vue';

import Layout from './frontend/Layout.js';
import ShipSelect from './frontend/ShipSelect.js';
import Modal from './frontend/Modal.js';
import InputEditor from './frontend/InputEditor.js';
import ColorInput from './frontend/ColorInput.js';
import ColorPicker from './frontend/ColorPicker.js';
import GamepadActionInput from './frontend/GamepadActionInput.js';
import GamepadEditor from './frontend/GamepadEditor.js';
import JoinForm from './frontend/JoinForm.js';
import KeyboardActionInput from './frontend/KeyboardActionInput.js';
import KeyboardEditor from './frontend/KeyboardEditor.js';
import PageIndicator from './frontend/PageIndicator.js';
import ShipInfo from './frontend/ShipInfo.js';
import ShipRender from './frontend/ShipRender.js';
import ShipStatIndicator from './frontend/ShipStatIndicator.js';
import ShipStats from './frontend/ShipStats.js';

const binder = ref({
    isGameRunning: false,
});

// <!---->

const AppComponent = {
    template: `<Layout v-if="!binder.isGameRunning" />`,
    data() {
        return {binder};
    }
};

const app = createApp(AppComponent);
app.component('ColorInput', ColorInput);
app.component('ColorPicker', ColorPicker);
app.component('GamepadActionInput', GamepadActionInput);
app.component('GamepadEditor', GamepadEditor);
app.component('InputEditor', InputEditor);
app.component('JoinForm', JoinForm);
app.component('KeyboardActionInput', KeyboardActionInput);
app.component('KeyboardEditor', KeyboardEditor);
app.component('Layout', Layout);
app.component('Modal', Modal);
app.component('PageIndicator', PageIndicator);
app.component('ShipInfo', ShipInfo);
app.component('ShipRender', ShipRender);
app.component('ShipSelect', ShipSelect);
app.component('ShipStatIndicator', ShipStatIndicator);
app.component('ShipStats', ShipStats);
app.mount('#app');

window.addEventListener('gamestart', () => {
    binder.value.isGameRunning = true;
});

window.addEventListener('gamestop', () => {
    binder.value.isGameRunning = false;
});

import { Engine } from "./engine";
import { JoinForm } from "./frontend/join_form";
import { KeysForm } from "./frontend/keys_form";

const forms = <HTMLElement>document.getElementById('forms');
const game = <HTMLCanvasElement>document.getElementById('game');
const hud = <HTMLCanvasElement>document.getElementById('hud');
const engine = new Engine(game, hud);

JoinForm.bind(engine);
KeysForm.bind();

window.addEventListener('keydown', e => {
    if (!engine.running
        || e.which != 27
        || !confirm('Leave Game?'))
        return;

    e.preventDefault();

    engine.stop();
});

engine.on('start', () => {
    forms.style.overflow = 'hidden';
});
engine.on('stop', () => {
    forms.style.overflow = 'visible';
});

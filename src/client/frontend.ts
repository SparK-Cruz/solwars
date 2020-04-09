import { Engine } from "./engine";
import { JoinForm } from "./frontend/join_form";
import { KeysForm } from "./frontend/keys_form";

const loading = <HTMLElement>document.getElementById('loading');
const frontend = <HTMLElement>document.getElementById('frontend');
const game = <HTMLCanvasElement>document.getElementById('game');
const engine = new Engine(game);

window.addEventListener('keydown', e => {
    if (!engine.running
        || e.which != 27
        || !confirm('Leave Game?'))
        return;

    e.preventDefault();

    engine.stop();
});

engine.on('load', () => {
    frontend.style.display = 'block';
    loading.style.display = 'none';

    JoinForm.bind(engine);
    KeysForm.bind();
});
engine.on('start', () => {
    frontend.style.display = 'none';
});
engine.on('stop', () => {
    frontend.style.display = 'block';
});

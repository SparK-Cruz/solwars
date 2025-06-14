import { Engine } from './engine.js';
import { IS_MOBILE } from './environment.js';

const game = <HTMLCanvasElement>document.getElementById("game");
const engine = new Engine(game);

window.addEventListener("keydown", (e) => {
    if (!engine.running || e.code != 'Escape')
        return;

    e.preventDefault();
    engine.stop();
});

document.addEventListener("fullscreenchange", (e) => {
    if (document.fullscreenElement)
        return;

    engine.stop();
});

engine.on("start", () => {
    window.dispatchEvent(new Event('gamestart'));

    if (!IS_MOBILE)
        return;

    game.requestFullscreen();
});
engine.on("stop", () => {
    window.dispatchEvent(new Event('gamestop'));
});

window.addEventListener('joingame', (e: any) => {
    engine.start(e.data);
});

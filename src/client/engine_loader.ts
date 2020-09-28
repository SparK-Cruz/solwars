import { Engine } from './engine';

const game = <HTMLCanvasElement>document.getElementById("game");
const engine = new Engine(game);

window.addEventListener("keydown", (e) => {
    if (!engine.running || e.which != 27 || !confirm("Leave Game?")) return;

    e.preventDefault();

    engine.stop();
});
engine.on("start", () => {
    window.dispatchEvent(new Event('gamestart'));
});
engine.on("stop", () => {
    window.dispatchEvent(new Event('gamestop'));
});

window.addEventListener('joingame', (e: any) => {
    engine.start(e.data);
});

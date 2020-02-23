import { Engine } from "./engine";

const game = <HTMLCanvasElement>document.getElementById('game');
const hud = <HTMLCanvasElement>document.getElementById('hud');
const engine = new Engine(game, hud);

document.getElementById('join-btn').addEventListener('click', e => {
    e.preventDefault();

    let name = localStorage.getItem('name');
    name = prompt('Enter a name', name || '');
    if (!name.trim()) {
        name = 'Anon' + (100 + Math.round(Math.random() * 899));
    }
    localStorage.setItem('name', name);

    engine.start(name, (data: any) => {
        if (data.error)
            alert(data.error);
    });
    return false;
});

window.addEventListener('keydown', e => {
    if (!engine.running
        || e.keyCode != 27
        || !confirm('Leave Game?'))
        return;

    engine.stop();
});

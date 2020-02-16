import { Client, ClientEvents, ClientInfo } from './client';
import { Input } from './input';
import { Camera } from './camera';
import { GameRenderer } from './game_renderer';
import { HudRenderer } from './hud_renderer';

// Game setup
const input = new Input(window);
const name = 'Anon' + (100 + Math.round(Math.random() * 899));

const client = new Client(name, input);

// HTML setup
const game = <HTMLCanvasElement> document.getElementById('canvas');
const hud = <HTMLCanvasElement> document.getElementById('hud');
function adjustCanvas(canvas: HTMLCanvasElement) {
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const aspect = window.innerWidth / window.innerHeight;
    canvas.width = aspect * canvas.height;
}

// Rendering Game setup
const camera = new Camera();
const gameRenderer = new GameRenderer(game, camera, client.getStage());

client.on(ClientEvents.SHIP, (ship: any) => {
    camera.trackable = ship;
});

// Rendering HUD setup
const hudRenderer = new HudRenderer(hud, camera, client.getStage());

client.on(ClientEvents.INFO, (info: ClientInfo) => {
    hudRenderer.update(info);
});

// Rendering setup
const FRAMESKIP_THRESHOLD = 55;
let lastTick = Date.now();

window.onresize = () => {
    adjustCanvas(game);
    adjustCanvas(hud);
};

function renderFrame() {
    const fps = Math.round(1000 / (Date.now() - lastTick));
    lastTick = Date.now();

    if (fps > FRAMESKIP_THRESHOLD) {
        camera.setResolution(game.width, game.height);
        gameRenderer.render();
        hudRenderer.render();
    }

    requestAnimationFrame(renderFrame);
}

// Fire it up
client.connect();
adjustCanvas(game);
adjustCanvas(hud);
renderFrame();

import { Camera } from './camera';
import { Renderable } from './game_renderers/renderable';
import { Background } from './game_renderers/background';

export class GameRenderer implements Renderable {
    private bg :Background;

    constructor(private app: any, camera: Camera) {
        this.bg = new Background(app, camera);
    }

    public render() {
        this.bg.render();
    }
}

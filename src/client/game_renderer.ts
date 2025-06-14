import { EventEmitter } from 'events';
import { Camera } from './camera.js';
import { Stage } from './stage.js';
import { Renderable } from './game_renderers/renderable.js';
import { Background } from './game_renderers/background.js';
import { EntityRenderer } from './game_renderers/entity_renderer.js';

export class GameRenderer extends EventEmitter implements Renderable {
    private bg: Background;
    private entities: EntityRenderer;

    constructor(parent: any, camera: Camera, stage: Stage) {
        super();

        this.bg = new Background(parent, camera);
        this.entities = new EntityRenderer(parent, camera, stage);
        this.entities.on('fail', (id: number) => this.emit('entity_fail', id));
    }

    public render() {
        this.bg.render();
        this.entities.render();
    }
}

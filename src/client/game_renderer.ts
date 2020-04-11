const PIXI = require('pixi.js');
import { Camera } from './camera';
import { Stage } from './stage';
import { Renderable } from './game_renderers/renderable';
import { Background } from './game_renderers/background';
import { EntityRenderer } from './game_renderers/entity_renderer';

export class GameRenderer implements Renderable {
    private bg: Background;
    private entities: EntityRenderer;

    constructor(parent: any, camera: Camera, stage: Stage) {
        this.bg = new Background(parent, camera);
        this.entities = new EntityRenderer(parent, camera, stage);
    }

    public render() {
        this.bg.render();
        this.entities.render();
    }
}

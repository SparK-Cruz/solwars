import * as PIXI from 'pixi.js';
import { RNG } from '../../space/rng.js';
import { Camera } from '../camera.js';
import { Renderable } from './renderable.js';

const SIZE = 4096;
const STAR_COUNT = [2000, 1700, 1400];
const SCROLL_FACTOR = [0.03, 0.09, 0.15];

export class Background implements Renderable {
    private buffers :HTMLCanvasElement[] = [
        document.createElement('canvas'),
        document.createElement('canvas'),
        document.createElement('canvas')
    ];
    private layers: any[] = [];

    constructor(parent: any, private camera: Camera) {
        let seed = 9876543210;
        RNG.random(seed);

        for (let i = this.buffers.length - 1; i >= 0; i--) {
            this.generate(this.buffers[i], STAR_COUNT[i]);
            this.layers[i] = new PIXI.TilingSprite({texture: PIXI.Texture.from(this.buffers[i]), width: this.buffers[i].width, height: this.buffers[i].height});
            parent.addChild(this.layers[i]);
        }
    }

    render() {
        const ref = this.camera.getPosition();

        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const factor = SCROLL_FACTOR[i];

            layer.tilePosition.set(-ref.x * factor, -ref.y * factor);
        }
    }

    private generate(buffer :HTMLCanvasElement, starCount :number) :void {
        buffer.width = SIZE;
        buffer.height = SIZE;

        const ctx = buffer.getContext('2d');

        for(let i = 0; i < starCount; i++) {
            let x = RNG.random() * SIZE | 0;
            let y = RNG.random() * SIZE | 0;
            let size = (0.9 + RNG.random() * 2) | 0;
            let shine = RNG.random() * 100 / 120;
            this.drawStar(ctx, x, y, size, shine);
        }
    }

    private drawStar(ctx :CanvasRenderingContext2D, x :number, y :number, size :number, shine :number) :void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, ' + shine + ')';
        ctx.arc(x,y,size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

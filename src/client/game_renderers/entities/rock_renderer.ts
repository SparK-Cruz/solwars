import { Rock } from "../../../space/entities/rock";
import { Renderable } from "../renderable";
import { R2d } from "../r2d";
import { Asset, Assets } from "../../assets";

export class RockRenderer implements Renderable {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private body: HTMLCanvasElement;
    private light: HTMLImageElement;

    constructor(public rock: Rock) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = rock.size;
        this.canvas.height = rock.size;

        Assets.fetch('img/rock.png').once('load', (sprite :Asset) => {
            this.body = this.draw(sprite.content, this.rock.size);
        });
        Assets.fetch('img/light.png').once('load', (sprite :Asset) => {
            this.light = sprite.content;
        });
    }

    public render(): HTMLCanvasElement {
        if (this.body && this.light) {
            this.ctx.drawImage(R2d.multiplyImage(this.body, this.light, this.rock.angle), 0, 0);
        }
        return this.canvas;
    }

    private draw(texture: HTMLImageElement, size: number): HTMLCanvasElement {
        const {buffer, bfr} = R2d.buffer(this.canvas);
        const mask = R2d.buffer(this.canvas);

        bfr.drawImage(texture, 0, 0);

        mask.buffer.width = size;
        mask.buffer.height = size;

        mask.bfr.clearRect(0, 0, mask.buffer.width, mask.buffer.height);
        mask.bfr.save();
        mask.bfr.beginPath();
        mask.bfr.translate(mask.buffer.width/2, mask.buffer.height/2);

        const geometry = this.rock.collisionMap.slice(0);
        const start = geometry.shift();
        mask.bfr.moveTo(start[0], start[1]);
        geometry.forEach(point => {
            mask.bfr.lineTo(point[0], point[1]);
        });
        mask.bfr.fillStyle = this.rock.color;
        mask.bfr.fill();
        mask.bfr.restore();

        return R2d.applyMask(buffer, mask.buffer);
    }
}

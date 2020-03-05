import { Rock } from "../../../space/entities/rock";
import { Renderable } from "../renderable";
import { Assets, Asset } from "../../assets";
import { R2d } from "../r2d";

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

        this.body = this.draw(rock.size);

        Assets.fetch('img/light.png', {target: this, callback: (sprite :Asset) => {
            this.light = sprite.content;
        }});
    }

    public render(): HTMLCanvasElement {
        if (this.light) {
            this.ctx.drawImage(R2d.multiplyImage(this.body, this.light, this.rock.angle), 0, 0);
        }
        return this.canvas;
    }

    private draw(size: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.translate(canvas.width/2, canvas.height/2);

        const geometry = this.rock.collisionMap.slice(0);
        const start = geometry.shift();
        ctx.moveTo(start[0], start[1]);
        geometry.forEach(point => {
            ctx.lineTo(point[0], point[1]);
        });
        ctx.fillStyle = this.rock.color;
        ctx.strokeStyle = '#000';
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        return canvas;
    }
}

import { Renderable } from "../game_renderers/renderable";

const pad = 20;

export class RankingRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D;
    private ranking: {name: string, bounty: number}[];

    public constructor(public canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d');
    }

    public update(ranking: {name: string, bounty: number}[]) {
        this.ranking = ranking;
    }

    public render() {
        if (!this.ranking)
            return;

        const pos = {
            x: this.canvas.width - pad,
            y: pad + 12,
        };

        this.ctx.save();
        this.ctx.fillStyle = "#3399ff";
        this.ctx.font = "12px monospace";

        const text = 'Bounty List';

        const textInfo = this.ctx.measureText(text);
        const textPos = {
            x: pos.x - textInfo.width,
            y: pos.y,
        };

        this.ctx.fillText(text, textPos.x, textPos.y);

        this.ranking.slice(0, 10).forEach((player, i) => {
            const text = player.name + ' (' + player.bounty + ')';

            const textInfo = this.ctx.measureText(text);
            const textPos = {
                x: pos.x - textInfo.width,
                y: pos.y + 16 * (i + 1),
            };

            this.ctx.fillText(text, textPos.x, textPos.y);
        });
        this.ctx.restore();

        return this.canvas;
    }
}

const PIXI = require('pixi.js');
import { IS_MOBILE } from "../environment";
import { Renderable } from "../game_renderers/renderable";

const PAD = 20;
const LIMIT = 10;
const SLOT_SIZE = 16;
const style = {
    fontFamily: 'monospace',
    fontSize: 12,
    fill: 0x3399ff,
};

export class RankingRenderer implements Renderable {
    private container: any;
    private pool: any[] = [];

    public constructor(private parent: any) {
        const container = new PIXI.Container();

        const title = new PIXI.Text('Bounty List', style);
        title.anchor.set(1, 0);
        container.addChild(title);

        for (let i = 0; i < LIMIT; i++) {
            const text = new PIXI.Text('', style);
            text.anchor.set(1, 0);
            text.visible = false;
            text.position.set(0, (i + 1) * SLOT_SIZE);
            container.addChild(text);

            this.pool.push(text);
        }

        parent.addChild(container);
        this.container = container;
    }

    public update(ranking: { name: string, bounty: number }[]) {
        this.pool.slice(ranking.length).forEach(t => { t.visible = false; });

        ranking.slice(0, Math.min(LIMIT, ranking.length)).forEach((entry, i) => {
            this.pool[i].visible = true;
            this.pool[i].text = `${entry.name} (${entry.bounty})`;
        });
    }

    public render() {
        if (IS_MOBILE) {
            this.container.position.set(this.container.width + PAD, PAD);
            return;
        }

        this.container.position.set(this.parent.view.width - PAD, PAD);
    }
}

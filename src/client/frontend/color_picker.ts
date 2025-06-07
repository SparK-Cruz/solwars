import { defineComponent } from "vue";

const range = (start: number, end: number): number[] => {
    return Array.apply(null, Array(end)).map((_: any, i: number) => i + start);
};
const c2h = (parts: number[]) => {
    const pad = '000000';
    return '#' + (pad + parts.reduce((a: number, c: number) => (a << 8) + c).toString(16)).substr(-pad.length);
}

const e = [
    [-0.75, -0.5],
    [0.75, -0.5],
    [0, 1],
];

const rad = 10;

const size = {
    x: 2 * rad,
    y: 2 * rad * Math.sin(60 * Math.PI / 180),
};

const step = 0x33; // color scale step

const res = 1 + 0xff / step;

const widths = range(0, res).map(d => {
    const odd = d * 2 + 1;
    return Math.ceil(odd / 2) * rad * 2 + Math.floor(odd / 2) * rad;
});

const colors = document.createElement('canvas');

const widthSet = widths.slice(Math.ceil(res / 2));

const stage = {
    width: widthSet.reduce((a: number, w: number) => a + w, size.x * 2),
    height: 13 * size.y + 2 * size.y,
};

const center = {
    x: stage.width - size.x / 2,
    y: stage.height / 2 - size.y / 2,
}

const vertices = range(0, 6).map(a => ({
    x: rad * Math.sin((a + 0.5) * Math.PI / 3),
    y: -rad * Math.cos((a + 0.5) * Math.PI / 3),
}));

const drawHex = (color: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff20';
    ctx.translate(size.x / 2, size.y / 2);
    ctx.beginPath();
    ctx.moveTo(vertices[vertices.length - 1].x, vertices[vertices.length - 1].y);
    for (let v of vertices) {
        ctx.lineTo(v.x, v.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    return canvas;
}

const draw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

    canvas.width = stage.width;
    canvas.height = stage.height;

    ctx.fillStyle = '#ffffff45';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsets = [0, widths[5], widths.slice(4).reduce((a, b) => a + b)].map((w, i) => ({ x: size.x + rad + w - stage.width, y: size.y * 4 - size.y / 2 * (2 - i) }));
    [].push.apply(offsets, range(3, 6).map(d => {
        const widthSet = widths.slice(Math.ceil(res / 2), d + 1);
        return {
            x: -widthSet.reduce((a, w, i) => a + (w / 2) + (i > 0 ? widthSet[i - 1] : 0) / 2, size.x),
            y: -size.y * 1.5,
        };
    }));

    for (let r = 0; r < res; r++) {
        for (let g = 0; g < res; g++) {
            for (let b = 0; b < res; b++) {
                const color = [r, g, b];

                const d = color.reduce((a, c) => Math.max(a, c));

                const pos = color
                    .map((c, i) => e[i].map(n => n * c))
                    .reduce(
                        (a, p) => ({ x: a.x + p[0] * size.x, y: a.y + p[1] * size.y }),
                        center,
                    );

                ctx.drawImage(drawHex(c2h(color.map(c => c * step))), pos.x + offsets[d].x, pos.y + offsets[d].y);
            }
        }
    }

    const bkp = colors.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    colors.width = canvas.width;
    colors.height = canvas.height;
    bkp.drawImage(canvas, 0, 0);
}

const drawCursor = (canvas: HTMLCanvasElement, mouse: { x: number, y: number }, color: number[]) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(colors, 0, 0);

    if (!color)
        return;

    ctx.save();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 18, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 18, Math.PI * 1.5, 2.5 * Math.PI);
    ctx.stroke();

    ctx.restore();

    ctx.strokeStyle = c2h(color);
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 14, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
};

export default defineComponent({
    name: 'ColorPicker',
    template: `
        <div class="color-picker">
            <section class="sidebar">
                <div class="previous" :style="{ backgroundColor: start || '#000000' }" />
                <div class="preview" @click="askHex" :style="{ backgroundColor: color }" />
                <div class="button reset" @click="resetToDefault">RESET</div>
            </section>
            <canvas ref="selector" class="selector" @mousemove="findColor" @click="pick"></canvas>
        </div>
    `,
    data: () => ({
        color: '#000000',
    }),
    props: ['start'],
    created() {
        this.$nextTick(() => {
            draw(this.$refs.selector);
            this.color = this.start || '#000000';
        });
    },
    methods: {
        findColor(e: MouseEvent) {
            const canvas = <HTMLCanvasElement>e.target;

            const rect = canvas.getBoundingClientRect();
            const offset = {
                x: rect.left,
                y: rect.top,
            };
            const mouse = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
            };

            canvas.style.cursor = 'none';

            const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

            const color = [].slice.call(ctx.getImageData(mouse.x, mouse.y, 1, 1).data, 0, 4);
            const alpha = color.pop();

            if (alpha < 200) {
                canvas.style.cursor = 'default';
            }

            if (alpha < 255) {
                drawCursor(canvas, mouse, null);
                return;
            }

            drawCursor(canvas, mouse, color);

            this.color = c2h(color);
        },
        pick() {
            this.$emit('pick', this.color);
        },
        resetToDefault() {
            this.$emit('pick', 'default');
        },
        askHex() {
            this.$emit('pick', prompt('Hex', this.color) || 'default');
        },
    },
});

// 00 33 66 99 cc ff
// 132 = 6 * 22
// 3 x 2 grid
// 396 x 264

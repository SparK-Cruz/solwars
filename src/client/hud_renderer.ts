import { Renderable } from "./game_renderers/renderable";
import { ClientInfo } from "./client";
import { Camera } from "./camera";
import { Mapping } from "../space/entities/ships/mapping";
import { Stage } from "../space/stage";
import { EntityType } from "../space/entities";

export class HudRenderer implements Renderable {
    private ctx: CanvasRenderingContext2D = null;

    private info: ClientInfo = {
        id: 0,
        ship: {
            id: null,
            make: null,
            model: null,
        },
        maxEnergy: 0,
        maxSpeed: 0,
        acceleration: 0,
        turnSpeed: 0,
        angle: 0,
        energy: 0,
        alive: false,
        cooldown: 0,
        gunHeat: 0,
        speed: {
            x: 0,
            y: 0,
        },
        position: {
            x: 0,
            y: 0,
        },
        control: 0,
    };

    public constructor(private canvas: HTMLCanvasElement, private camera: Camera, private stage: Stage) {
        this.ctx = canvas.getContext('2d');
    }

    public update(info: ClientInfo) {
        this.info = info;
    }

    public render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderEnergy();
        this.renderSpeedIndicator();
        this.renderGunIndicator();
        this.renderRadar();

        return this.canvas;
    }

    private renderEnergy(): void {
        const perc = Math.max(this.info.energy / this.info.maxEnergy, 0);
        let color = "#3399ff";
        if (perc < 0.4) {
            color = "#ff9933";
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(20, this.canvas.height - 250, 6, 230);
        this.ctx.strokeStyle = "#202020";
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(22, (this.canvas.height - 248) + 226 - 226 * perc, 2, 226 * perc);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }

    private renderSpeedIndicator(): void {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const indicatorSize = 6;
        const speed = Math.sqrt(Math.pow(this.info.speed.x, 2) + Math.pow(this.info.speed.y, 2));
        const speedScale = 6;
        const alpha = speed / (this.info.maxSpeed * 2);
        const angleOffset = 90 * Math.PI / 180;
        const angle = Math.atan2(this.info.speed.y, this.info.speed.x) + angleOffset;
        let baseColor = [51, 159, 255].join(', ');

        if (this.info.control & Mapping.AFTERBURNER) {
            baseColor = [255, 159, 51].join(', ');
        }
        
        const half = 16;
        canvas.width = half * 2;
        canvas.height = half * 2;
        
        ctx.save();
        ctx.translate(half, half);
        ctx.rotate(angle);
        ctx.moveTo(-indicatorSize, indicatorSize);
        ctx.lineTo(0, 0);
        ctx.lineTo(indicatorSize, indicatorSize);

        if (alpha > 0.5) {
            ctx.moveTo(-indicatorSize, 0);
            ctx.lineTo(0, -indicatorSize);
            ctx.lineTo(indicatorSize, 0);
        }

        ctx.lineWidth = 3;
        ctx.lineCap = "butt";
        ctx.strokeStyle = "rgba(" + baseColor + ", " + Math.min(alpha * 0.6, 1) + ")";
        ctx.stroke();
        ctx.restore();

        const point = this.camera.addOffset({
            x: this.info.speed.x * speedScale - half,
            y: this.info.speed.y * speedScale - half,
        });

        this.ctx.save();
        this.ctx.drawImage(canvas, point.x, point.y);
        this.ctx.restore();
    }

    private renderGunIndicator(): void {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const bullets = Math.floor(this.info.energy / 150);
        const len = bullets * 4;
        
        canvas.height = Math.max(len, 1);
        canvas.width = 3;

        ctx.save();
        ctx.strokeStyle = "rgba(51, 159, 255, 0.3)";
        ctx.setLineDash([3,1]);
        ctx.translate(1, 0);
        ctx.lineWidth = 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(0, len);
        ctx.stroke();
        ctx.restore();

        const pos = this.camera.addOffset({x: 0, y: 0});
        this.ctx.save();
        this.ctx.translate(pos.x, pos.y);
        this.ctx.rotate(this.info.angle * Math.PI / 180);
        this.ctx.drawImage(canvas, 0, -(100 + len / 2));
        this.ctx.restore();
    }

    private renderRadar() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = 1/20;
        const regionScale = 1/512;

        const positionText = [
            'H: ',
            Math.floor(this.info.position.x * regionScale),
            ' ',
            'V: ',
            Math.floor(this.info.position.y * regionScale)
        ].join('');

        canvas.width = 200;
        canvas.height = 230;

        ctx.save();
        ctx.fillStyle = "#3399ff";
        ctx.font = "16px monospace";
        const text = ctx.measureText(positionText);
        ctx.fillText(positionText, canvas.width / 2 - text.width / 2, 20);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(51, 159, 255, 1)";
        ctx.lineWidth = 2;
        ctx.arc(
            100,
            130,
            99,
            0,
            Math.PI * 2,
            false
        );
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 30, 200, 200);
        ctx.restore();

        ctx.save();
        ctx.translate(100, 130);

        const entities = this.stage.fetchAllEntities();
        for(let i in entities) {
            const entity = entities[i];
            let size = 3;
            ctx.fillStyle = "#ff9933";
            if (entity.id == this.info.id) {
                ctx.fillStyle = "#ffffff";
            }
            if (entity.type.name === EntityType.Bullet.name) {
                ctx.fillStyle = "#ff0000";
                size = 1;
            }

            const pos = this.camera.translate(entity);
            ctx.fillRect(pos.x * scale - size / 2, pos.y * scale - size / 2, size, size);

            if (typeof (<any>entity).name != 'undefined') {
                let name = (<any>entity).name;

                if (typeof (<any>entity).alive != 'undefined'
                    && !(<any>entity).alive) {
                    name = '(Dead) ' + name;
                }

                this.ctx.save();
                this.ctx.fillStyle = "#3399ff";
                this.ctx.font = "12px monospace";

                const textInfo = this.ctx.measureText(name);
                let textPos = {
                    x: pos.x - textInfo.width / 2 + this.camera.offset.x,
                    y: pos.y + 40 + this.camera.offset.y,
                };

                if (entity.id == this.info.id) {
                    textPos = {
                        x: 20,
                        y: 20,
                    };
                }

                this.ctx.fillText(name, textPos.x, textPos.y);
                this.ctx.restore();
            }
        }

        ctx.restore();

        this.ctx.save();
        this.ctx.drawImage(canvas, this.canvas.width - 220, this.canvas.height - 250);
        this.ctx.restore();
    }
}
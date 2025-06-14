export namespace R2d {
    export function multiplyImage(source :HTMLCanvasElement, multiplier :HTMLCanvasElement | HTMLImageElement, angle :number) :HTMLCanvasElement {
        // @ts-ignore
        const self = this;

        const {buffer, bfr} = self.buffer(source);
        const light = self.buffer(multiplier);
        const mask = self.buffer(source);

        const lightCenter = {
          x: light.buffer.width / 2,
          y: light.buffer.height / 2
        };

        light.bfr.save();
        light.bfr.translate(lightCenter.x, lightCenter.y);
        light.bfr.rotate(-angle * Math.PI / 180);
        light.bfr.drawImage(multiplier, -lightCenter.x, -lightCenter.y);
        light.bfr.restore();

        mask.bfr.save();
        mask.bfr.drawImage(source, 0, 0);
        mask.bfr.globalCompositeOperation = 'multiply';
        mask.bfr.drawImage(light.buffer, 0, 0, buffer.width, buffer.height);
        mask.bfr.restore();

        bfr.save();
        bfr.drawImage(self.applyMask(mask.buffer, source), 0, 0);
        bfr.restore();

        return buffer;
    }

    export function multiplyColor(source :HTMLImageElement, color :string) :HTMLCanvasElement {
        // @ts-ignore
        const self = this;

        const {buffer, bfr} = self.buffer(source);

        bfr.save();
        bfr.drawImage(source, 0, 0);
        bfr.globalCompositeOperation = 'multiply';
        bfr.fillStyle = color;
        bfr.fillRect(0, 0, buffer.width, buffer.height);
        bfr.restore();

        return buffer;
    }

    export function applyMask(source :HTMLCanvasElement | HTMLImageElement, maskImage :HTMLCanvasElement | HTMLImageElement) :HTMLCanvasElement {
        // @ts-ignore
        const self = this;

        const {buffer, bfr} = self.buffer(source);

        bfr.save();
        bfr.drawImage(source, 0, 0);
        bfr.globalCompositeOperation = 'destination-in';
        bfr.drawImage(maskImage, 0, 0);
        bfr.restore();

        return buffer;
    }

    export function buffer(source :HTMLCanvasElement | HTMLImageElement = null) :{buffer :HTMLCanvasElement, bfr :CanvasRenderingContext2D} {
        const buffer = document.createElement('canvas');

        if (source) {
            buffer.width = source.width;
            buffer.height = source.height;
        }

        const bfr = buffer.getContext('2d');

        return {buffer, bfr};
    }
}

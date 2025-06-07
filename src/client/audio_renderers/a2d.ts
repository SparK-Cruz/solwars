export namespace A2d {

    export function source(context: AudioContext) {
        const source = context.createPanner();
        const gain = context.createGain();

        source.panningModel = 'HRTF';
        source.refDistance = 50;
        source.rolloffFactor = 0.5;

        // TODO: read user sfx volume option
        gain.gain.value = 0.5;

        source.connect(gain);
        gain.connect(context.destination);

        // Chrome is a bitch
        context.resume();

        return source;
    }

    export function audio(source: PannerNode, file: string) {
        const audio = new Audio(file);
        const media = (<AudioContext>source.context).createMediaElementSource(audio);

        media.connect(source);
        // audio.addEventListener('ended', () => {
        //     media.disconnect(source);
        //     audio.remove();
        //     audio.srcObject = null;
        // }, {once: true});

        return audio;
    }
}

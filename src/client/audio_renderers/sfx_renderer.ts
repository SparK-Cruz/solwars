import { A2d } from "./a2d";

export class SfxRenderer {
  private queueIndex = 0;
  private audioPool: { audio: HTMLAudioElement, source: PannerNode }[] = [];

  public constructor(private context: AudioContext, private filename: string, private poolSize: number = 10) {
    this.audioPool = Array(poolSize).fill(null).map(() => {
      const source = A2d.source(this.context);
      return {
        source,
        audio: A2d.audio(source, filename),
      };
    });
  }

  public playAt(x: number, y: number, z: number = 10) {
    const pair = this.audioPool[this.queueIndex];

    if (!pair) console.log(this.audioPool, this.queueIndex);

    this.queueIndex = (this.queueIndex + 1) % this.poolSize;

    pair.source.positionX.value = x;
    pair.source.positionY.value = y;
    pair.source.positionZ.value = z;
    pair.audio.pause();
    pair.audio.currentTime = 0;
    pair.audio.play();
  }
}

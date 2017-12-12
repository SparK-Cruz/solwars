export namespace RNG {
  let seq = 1;
  export function random(seed ?:number) {
    if (typeof seed != 'undefined') {
      seq = seed;
    }
    let x = Math.sin(seq++) * 10000;
    return x - Math.floor(x);
  }
}

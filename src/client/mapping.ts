export class Mapping {
  static FORWARD = 1;       //0000001
  static BACKWARD = 2;      //0000010
  static LEFT = 4;          //0000100
  static RIGHT = 8;         //0001000
  static SLIDE = 16;        //0010000
  static STRIFE_LEFT = 32;  //0100000
  static STRIFE_RIGHT = 64; //1000000

  private oldState = 0;
  private state = 0;

  press(flag :number) {
    this.oldState = this.state;
    this.state |= flag;

    return this.oldState !== this.state;
  }
  release(flag :number) {
    this.oldState = this.state;
    this.state &= ~flag;

    return this.oldState !== this.state;
  }

  getState() :number {
    return this.state;
  }
}

export class Mapping {
  static FORWARD = 1;       //000000001
  static BACKWARD = 2;      //000000010
  static LEFT = 4;          //000000100
  static RIGHT = 8;         //000001000
  static STRIFE_LEFT = 16;  //000100000
  static STRIFE_RIGHT = 32; //001000000
  static SHOOT = 64;        //010000000
  static RUN = 128;         //100000000

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

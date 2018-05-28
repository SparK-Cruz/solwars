export class Mapping {
    static FORWARD = 1;       //00000001
    static BACKWARD = 2;      //00000010
    static LEFT = 4;          //00000100
    static RIGHT = 8;         //00001000
    static STRIFE_LEFT = 16;  //00010000
    static STRIFE_RIGHT = 32; //00100000
    static SHOOT = 64;        //01000000
    static SLIDE = 128;       //10000000

    public state = 0;

    public press(flag :number) {
        this.state |= flag;
        return this;
    }
    public release(flag :number) {
        this.state &= ~flag;
        return this;
    }
}

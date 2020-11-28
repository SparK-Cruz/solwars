export class Mapping {
    static FORWARD = 1;           //00000001
    static BACKWARD = 1 << 1;     //00000010
    static LEFT = 1 << 2;         //00000100
    static RIGHT = 1 << 3;        //00001000
    static STRAFE_LEFT = 1 << 4;  //00010000
    static STRAFE_RIGHT = 1 << 5; //00100000
    static SHOOT = 1 << 6;        //01000000
    static AFTERBURNER = 1 << 7;  //10000000

    public state = 0;

    public press(flag: number) {
        const last = this.state;
        this.state |= flag;
        return this.state !== last;
    }
    public release(flag: number) {
        const last = this.state;
        this.state &= ~flag;
        return this.state !== last;
    }
}

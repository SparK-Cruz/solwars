import { Mapping } from './mapping';

export namespace Control {
    export function thrusting(state :number) :number {
        let result = 0;
        result += (state & Mapping.FORWARD) > 0 ? 1 : 0;
        result -= (state & Mapping.BACKWARD) > 0 ? 1 : 0;
        return result;
    }
    export function strifing(state :number) :number {
        let result = 0;
        result += (state & Mapping.STRAFE_RIGHT) > 0 ? 1 : 0;
        result -= (state & Mapping.STRAFE_LEFT) > 0 ? 1 : 0;
        return result;
    }
    export function turning(state :number) :number {
        let result = 0;
        result += (state & Mapping.RIGHT) > 0 ? 1 : 0;
        result -= (state & Mapping.LEFT) > 0 ? 1 : 0;
        return result;
    }
    export function shooting(state :number) :number {
        return (state & Mapping.SHOOT) > 0 ? 1 : 0;
    }
    export function afterburning(state :number) :number {
        return (state & Mapping.AFTERBURNER) > 0 ? 1 : 0;
    }
}

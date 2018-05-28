import { Controllable } from '../controllable';
import { Mapping } from './mapping';

export namespace Control {
    export function thrusting(state :number) :number {
        if (sliding(state)) return 0;

        let result = 0;
        result += (state & Mapping.FORWARD) > 0 ? 1 : 0;
        result -= (state & Mapping.BACKWARD) > 0 ? 1 : 0;
        return result;
    }
    export function strifing(state :number) :number {
        if (sliding(state)) return 0;

        let result = 0;
        result += (state & Mapping.STRIFE_RIGHT) > 0 ? 1 : 0;
        result -= (state & Mapping.STRIFE_LEFT) > 0 ? 1 : 0;
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
    export function sliding(state :number) :number {
        return (state & Mapping.SLIDE) > 0 ? 1 : 0;
    }
}

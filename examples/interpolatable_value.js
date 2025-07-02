/*
    Example of an Interpolatable Value.
        
    Interpolation returns the previous state and a percentage of the
    difference defined by a delta value between [0-1].

    Operations like "translation" need update BOTH [prev state, current state].
*/
export class InterpolatedNumber {
    #prevNum;
    #num;
    constructor(val) {
        this.#prevNum = val;
        this.#num = val;
    }
    get value() {
        return this.#num;
    }
    add(val) {
        this.#prevNum = this.#num;
        this.#num += val;
    }
    translate(val) {
        let delta = this.#num - val;
        this.#prevNum -= delta;
        this.#num -= delta;
    }
    interpolate(delta) {
        delta = Math.max(0, Math.min(delta, 1));
        // x0 + ((x1 - x0) * delta
        return this.#prevNum + (this.#num - this.#prevNum) * delta;
    }
}

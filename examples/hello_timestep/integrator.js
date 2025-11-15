import { InterpolatedNumber } from "./interpolatable_value.js";
// Some app state
let speed = 3;
let size = 50;
let rect = {
    x: new InterpolatedNumber(-50),
    y: 50,
};
/*
    An example of an integrator.

    This renderer interacts with the app state above in sliding_square.js
*/
class Integrator {
    #canvas;
    #ctx = null;
    constructor(canvas) {
        this.#canvas = canvas;
        if (canvas)
            this.#ctx = canvas.getContext("2d");
    }
    integrate(_msInterval) {
        rect.x.add(speed);
        // wrap along x axis
        if (this.#canvas && this.#canvas.width < rect.x.value) {
            rect.x.translate(-size);
        }
    }
    render(deltaRemainder) {
        if (this.#canvas && this.#ctx) {
            this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            this.#ctx.fillRect(rect.x.interpolate(deltaRemainder), rect.y, size, size);
        }
    }
    error(e) {
        console.log("error!", e);
    }
}
export { Integrator };

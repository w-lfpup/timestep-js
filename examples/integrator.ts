import type { IntegratorInterface } from "timestep";

import { InterpolatedNumber } from "./interpolatable_value.js";

// Some app state
let speed = 3;
let size = 50;

let rect = {
	x: new InterpolatedNumber(-50),
	y: 50,
};

/*
	An example of a "renderer" class.

	This renderer interacts with the "app" in sliding_square.js
*/
class Integrator implements IntegratorInterface {
	#canvas: HTMLCanvasElement | null;
	#ctx: CanvasRenderingContext2D | null = null;

	constructor(canvas: HTMLCanvasElement | null) {
		this.#canvas = canvas;
		if (canvas) this.#ctx = canvas.getContext("2d");
	}

	integrate(_msInterval: number) {
		rect.x.add(speed);

		// wrap along x axis
		if (this.#canvas && this.#canvas.width < rect.x.value) {
			rect.x.translate(-size);
		}
	}

	render(_msInterval: number, deltaRemainder: number) {
		if (this.#canvas && this.#ctx) {
			this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
			this.#ctx.fillRect(
				rect.x.interpolate(deltaRemainder),
				rect.y,
				size,
				size,
			);
		}
	}

	error(e: Error) {
		console.log("error!", e);
	}
}

export { Integrator };

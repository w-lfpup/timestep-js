export type { TimestepInterface, RendererInterface };
export { Timestep };

// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value

interface RendererInterface {
	integrate(msInterval: number): void;
	render(msInterval: number, remainderDelta: number): void;
	error(err: Error): void;
}

interface TimestepInterface {
	start(): void;
	stop(): void;
}

let MIN_STEP = 1;

interface Params {
	renderer: RendererInterface;
	msMaxIntegration?: number;
	msInterval?: number;
}

interface State {
	accumulator: number;
	msInterval: number;
	inverseInterval: number;
	msMaxIntegration: number;
	prevTimestamp?: DOMHighResTimeStamp;
	receipt?: number;
}

class Timestep implements TimestepInterface {
	#boundLoop: (now: DOMHighResTimeStamp) => void;
	#renderer: RendererInterface;
	#state: State;

	constructor(params: Params) {
		this.#boundLoop = this.#loop.bind(this);

		let { renderer, msInterval, msMaxIntegration } = params;
		this.#renderer = renderer;
		this.#state = getState(msInterval, msMaxIntegration);
	}

	start() {
		if (this.#state.receipt) return;
		this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
		this.#state.prevTimestamp = performance.now();
	}

	stop() {
		window.cancelAnimationFrame(this.#state.receipt);
		this.#state.receipt = undefined;
	}

	#loop(now: DOMHighResTimeStamp) {
		this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
		integrateAndRender(this.#renderer, this.#state, now);
	}
}

function getState(intrvlMs: number = MIN_STEP, msMaxIntegration: number = 250) {
	let msInterval = Math.max(intrvlMs, MIN_STEP);
	let inverseInterval = 1 / msInterval;

	return {
		accumulator: 0,
		inverseInterval,
		msInterval,
		msMaxIntegration: msMaxIntegration ?? 250,
		prevTimestamp: undefined,
		receipt: undefined,
	};
}

function integrateAndRender(
	renderer: RendererInterface,
	state: State,
	now: DOMHighResTimeStamp,
) {
	const delta = now - state.prevTimestamp;
	if (delta > state.msMaxIntegration) {
		renderer.error(new Error("Timestep exceeded maximum integration time."));
	}

	state.accumulator += now - state.prevTimestamp;
	state.prevTimestamp = now;

	while (state.accumulator > state.msInterval) {
		renderer.integrate(state.msInterval);
		state.accumulator -= state.msInterval;
	}

	const integrated = state.accumulator * state.inverseInterval;
	renderer.render(state.msInterval, integrated);
}

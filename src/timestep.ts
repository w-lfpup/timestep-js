export type { TimestepInterface, IntegratorInterface };
export { Timestep };

// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame#return_value

interface IntegratorInterface {
	integrate(msInterval: number, accumulator: number): void;
	render(msInterval: number, remainderDelta: number): void;
	error(err: Error): void;
}

interface TimestepInterface {
	start(): void;
	stop(): void;
}

let MIN_STEP = 1;

interface Params {
	integrator: IntegratorInterface;
	msMaxIntegration?: number;
	msInterval?: number;
}

interface State {
	accumulator: number;
	msInterval: number;
	inverseInterval: number;
	msMaxIntegration: number;
	prevTimestamp: DOMHighResTimeStamp;
	receipt?: number;
}

class Timestep implements TimestepInterface {
	#boundLoop: (now: DOMHighResTimeStamp) => void;
	#integrator: IntegratorInterface;
	#state: State;

	constructor(params: Params) {
		this.#boundLoop = this.#loop.bind(this);

		let { integrator, msInterval, msMaxIntegration } = params;
		this.#integrator = integrator;
		this.#state = getState(msInterval, msMaxIntegration);
	}

	start() {
		if (this.#state.receipt) return;
		this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
		this.#state.prevTimestamp = performance.now();
	}

	stop() {
		if (this.#state.receipt) window.cancelAnimationFrame(this.#state.receipt);

		this.#state.receipt = undefined;
	}

	#loop(now: DOMHighResTimeStamp) {
		this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
		integrateAndRender(this.#integrator, this.#state, now);
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
		prevTimestamp: -1,
		receipt: undefined,
	};
}

function integrateAndRender(
	integrator: IntegratorInterface,
	state: State,
	now: DOMHighResTimeStamp,
) {
	const delta = now - state.prevTimestamp;
	if (delta > state.msMaxIntegration) {
		integrator.error(new Error("Timestep exceeded maximum integration time."));
	}

	state.accumulator += now - state.prevTimestamp;
	state.prevTimestamp = now;

	while (state.msInterval < state.accumulator) {
		integrator.integrate(state.msInterval, state.accumulator);
		state.accumulator -= state.msInterval;
	}

	const interpolated = state.accumulator * state.inverseInterval;
	integrator.render(state.msInterval, interpolated);
}

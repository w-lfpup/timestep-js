export interface IntegratorInterface {
	integrate(msInterval: number): void;
	render(msInterval: number, remainderDelta: number): void;
	error(err: Error): void;
}

export interface TimestepInterface {
	start(): void;
	stop(): void;
}

export interface Params {
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
	receipt?: ReturnType<Window["requestAnimationFrame"]>;
}

let MIN_STEP = 6;

export class Timestep implements TimestepInterface {
	#boundLoop = this.#loop.bind(this);
	#integrator: IntegratorInterface;
	#state: State;

	constructor(params: Params) {
		let { integrator, msInterval, msMaxIntegration } = params;
		this.#integrator = integrator;
		this.#state = getState(msInterval, msMaxIntegration);
	}

	#loop(now: DOMHighResTimeStamp): void {
		this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
		integrateAndRender(this.#integrator, this.#state, now);
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
}

function getState(msInterval: number = MIN_STEP, msMaxIntegration: number = 250) {
	msInterval = Math.max(msInterval, MIN_STEP);
	msMaxIntegration = Math.max(1, msMaxIntegration);
	let inverseInterval = 1 / msInterval;

	return {
		accumulator: 0,
		prevTimestamp: -1,
		receipt: undefined,
		inverseInterval,
		msInterval,
		msMaxIntegration,
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
		integrator.integrate(state.msInterval);
		state.accumulator -= state.msInterval;
	}

	const interpolated = state.accumulator * state.inverseInterval;
	integrator.render(state.msInterval, interpolated);
}

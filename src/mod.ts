export interface IntegratorInterface {
	integrate(intervalMs: number): void;
	render(remainderDelta: number): void;
	error(err: Error): void;
}

export interface TimestepInterface {
	start(): void;
	stop(): void;
}

export interface Params {
	integrator: IntegratorInterface;
	maxIntegrationMs?: number;
	intervalMs?: number;
}

interface State {
	accumulator: number;
	intervalMs: number;
	inverseInterval: number;
	maxIntegrationMs: number;
	prevTimestamp: DOMHighResTimeStamp;
	receipt?: ReturnType<Window["requestAnimationFrame"]>;
}

let MIN_STEP = 6;

export class Timestep implements TimestepInterface {
	#boundLoop = this.#loop.bind(this);
	#integrator: IntegratorInterface;
	#state: State;

	constructor(params: Params) {
		let { integrator, intervalMs, maxIntegrationMs } = params;
		this.#integrator = integrator;
		this.#state = getState(intervalMs, maxIntegrationMs);
	}

	#loop(now: DOMHighResTimeStamp): void {
		this.#state.receipt = requestAnimationFrame(this.#boundLoop);
		integrateAndRender(this.#integrator, this.#state, now);
	}

	start() {
		if (this.#state.receipt) return;
		this.#state.receipt = requestAnimationFrame(this.#boundLoop);
		this.#state.prevTimestamp = performance.now();
	}

	stop() {
		if (this.#state.receipt) cancelAnimationFrame(this.#state.receipt);
		this.#state.receipt = undefined;
	}
}

function getState(
	intervalMs: number = MIN_STEP,
	maxIntegrationMs: number = 250,
) {
	intervalMs = Math.max(intervalMs, MIN_STEP);
	maxIntegrationMs = Math.max(1, maxIntegrationMs);
	let inverseInterval = 1 / intervalMs;

	return {
		accumulator: 0,
		prevTimestamp: -1,
		receipt: undefined,
		inverseInterval,
		intervalMs,
		maxIntegrationMs,
	};
}

function integrateAndRender(
	integrator: IntegratorInterface,
	state: State,
	now: DOMHighResTimeStamp,
) {
	const delta = now - state.prevTimestamp;
	if (delta > state.maxIntegrationMs) {
		integrator.error(new Error("Timestep exceeded maximum integration time."));
	}

	state.accumulator += now - state.prevTimestamp;
	state.prevTimestamp = now;

	while (state.intervalMs < state.accumulator) {
		integrator.integrate(state.intervalMs);
		state.accumulator -= state.intervalMs;
	}

	const interpolated = state.accumulator * state.inverseInterval;
	integrator.render(interpolated);
}

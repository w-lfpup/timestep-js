let MIN_STEP = 6;
export class Timestep {
    #boundLoop = this.#loop.bind(this);
    #integrator;
    #state;
    constructor(params) {
        let { integrator, intervalMs, maxIntegrationMs } = params;
        this.#integrator = integrator;
        this.#state = getState(intervalMs, maxIntegrationMs);
    }
    #loop(now) {
        this.#state.receipt = requestAnimationFrame(this.#boundLoop);
        integrateAndRender(this.#integrator, this.#state, now);
    }
    start() {
        if (this.#state.receipt)
            return;
        this.#state.receipt = requestAnimationFrame(this.#boundLoop);
        this.#state.prevTimestamp = performance.now();
    }
    stop() {
        if (this.#state.receipt)
            cancelAnimationFrame(this.#state.receipt);
        this.#state.receipt = undefined;
    }
}
function getState(intervalMs = MIN_STEP, maxIntegrationMs = 250) {
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
function integrateAndRender(integrator, state, now) {
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

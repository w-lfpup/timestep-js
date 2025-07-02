let MIN_STEP = 6;
export class Timestep {
    #boundLoop = this.#loop.bind(this);
    #integrator;
    #state;
    constructor(params) {
        let { integrator, msInterval, msMaxIntegration } = params;
        this.#integrator = integrator;
        this.#state = getState(msInterval, msMaxIntegration);
    }
    #loop(now) {
        this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
        integrateAndRender(this.#integrator, this.#state, now);
    }
    start() {
        if (this.#state.receipt)
            return;
        this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
        this.#state.prevTimestamp = performance.now();
    }
    stop() {
        if (this.#state.receipt)
            window.cancelAnimationFrame(this.#state.receipt);
        this.#state.receipt = undefined;
    }
}
function getState(msInterval = MIN_STEP, msMaxIntegration = 250) {
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
function integrateAndRender(integrator, state, now) {
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

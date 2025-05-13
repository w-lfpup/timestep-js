export { Timestep };
let MIN_STEP = 1;
class Timestep {
    #boundLoop;
    #integrator;
    #state;
    constructor(params) {
        this.#boundLoop = this.#loop.bind(this);
        let { integrator, msInterval, msMaxIntegration } = params;
        this.#integrator = integrator;
        this.#state = getState(msInterval, msMaxIntegration);
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
        this.#state.receipt = -1;
    }
    #loop(now) {
        this.#state.receipt = window.requestAnimationFrame(this.#boundLoop);
        integrateAndRender(this.#integrator, this.#state, now);
    }
}
function getState(intrvlMs = MIN_STEP, msMaxIntegration = 250) {
    let msInterval = Math.max(intrvlMs, MIN_STEP);
    let inverseInterval = 1 / msInterval;
    return {
        accumulator: 0,
        inverseInterval,
        msInterval,
        msMaxIntegration: msMaxIntegration ?? 250,
        prevTimestamp: -1,
        receipt: -1,
    };
}
function integrateAndRender(integrator, state, now) {
    const delta = now - state.prevTimestamp;
    if (delta > state.msMaxIntegration) {
        integrator.error(new Error("Timestep exceeded maximum integration time."));
    }
    state.accumulator += now - state.prevTimestamp;
    state.prevTimestamp = now;
    while (state.accumulator > state.msInterval) {
        integrator.integrate(state.msInterval);
        state.accumulator -= state.msInterval;
    }
    const integrated = state.accumulator * state.inverseInterval;
    integrator.render(state.msInterval, integrated);
}

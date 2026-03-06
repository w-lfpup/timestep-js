import { Timestep } from "../dist/mod.js";
function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
class Integrator {
    integrateCount = 0;
    renderCount = 0;
    integrate(_intervalMs) {
        this.integrateCount += 1;
    }
    render(_integrationRemainderMs) {
        this.renderCount += 1;
    }
    error(_e) { }
}
async function testIntegrationAndRender() {
    const assertions = [];
    const integrator = new Integrator();
    const timestep = new Timestep({ integrator, intervalMs: 10 });
    timestep.start();
    await sleep(1100);
    timestep.stop();
    if (integrator.integrateCount < 100) {
        assertions.push(`failed to integrate enough times: ${integrator.integrateCount}`);
    }
    if (integrator.renderCount < 10) {
        assertions.push(`failed to render enough times: ${integrator.integrateCount}`);
    }
    return assertions;
}
export const tests = [testIntegrationAndRender];
export const options = {
    title: import.meta.url,
};

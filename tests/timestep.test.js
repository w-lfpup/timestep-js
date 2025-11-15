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
    integrate(intervalMs) {
        this.integrateCount += 1;
    }
    render(integrationRemainderMs) {
        this.renderCount += 1;
    }
    error(e) { }
}
async function testIntegrationAndRender() {
    const assertions = [];
    const integrator = new Integrator();
    const timestep = new Timestep({ integrator, intervalMs: 10 });
    timestep.start();
    await sleep(1000);
    timestep.stop();
    if (integrator.integrateCount < 100) {
        assertions.push("failed to integrate enough times");
    }
    if (integrator.renderCount < 10) {
        assertions.push("failed to render enough times");
    }
    return assertions;
}
export const tests = [testIntegrationAndRender];
export const options = {
    title: import.meta.url,
};

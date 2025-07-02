import type { IntegratorInterface } from "./mod.js";

import { Timestep } from "./mod.js";

function sleep(time: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

class Integrator implements IntegratorInterface {
	integrateCount: number = 0;
	renderCount: number = 0;

	integrate(msInterval: number) {
		this.integrateCount += 1;
	}

	render(msInterval: number, integrationRemainderMs: number) {
		this.renderCount += 1;
	}

	error(e: Error) {}
}

async function testIntegrationAndRender() {
	const assertions = [];

	const integrator = new Integrator();
	const timestep = new Timestep({ integrator, msInterval: 10 });

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

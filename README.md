# Timestep

A fixed timestep.

## How to use

### Integrator

`Timestep` uses an `integrator` to connect a game loop with game state.

Create the following interface:

```ts
// my_integrator.ts

import type { IntegratorInterface } from "timestep";

class Integrator implements IntegratorInterface {
	integrate(msInterval: number): void {
		// tick through physics step
	}

	render(deltaRemainder: number): void {
		// Draw to canvas or update dom.
		//
		// Interpolate between [previous state, current state]
		// with the delta remainder [0, 1].
	}

	error(e: Error) {
		// maximum integration time was exceeded
	}
}
```

The `integrate` function is called between renders.

After integration, the `render` funtion is called and given the timestep remainder.

### Timestep

Pass an `Integrator` to an instance of `Timestep`.

```ts
import { Timestep } from "timestep";
import { Integrator } from "my_integrator.ts";

let intervalMs = 10; // millisecond integration interval
let integrator = new Integrator();
const timestep = new Timestep({ intervalMs, integrator });
```

Then call `start` or `stop` where appropriate.

```ts
timestep.start();
timestep.stop();
```

### Example

Checkout a tiny
(
[code](https://github.com/w-lfpup/timestep-js/tree/main/examples) |
[live](https://w-lfpup.github.io/timestep-js/examples/)
) example.

## License

`Timestamp-js` is released under the BSD 3-Clause License.

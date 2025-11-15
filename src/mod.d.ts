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
export declare class Timestep implements TimestepInterface {
	#private;
	constructor(params: Params);
	start(): void;
	stop(): void;
}

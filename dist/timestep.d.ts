export type { TimestepInterface, IntegratorInterface };
export { Timestep };
interface IntegratorInterface {
    integrate(msInterval: number, accumulator: number): void;
    render(msInterval: number, remainderDelta: number): void;
    error(err: Error): void;
}
interface TimestepInterface {
    start(): void;
    stop(): void;
}
interface Params {
    integrator: IntegratorInterface;
    msMaxIntegration?: number;
    msInterval?: number;
}
declare class Timestep implements TimestepInterface {
    #private;
    constructor(params: Params);
    start(): void;
    stop(): void;
}

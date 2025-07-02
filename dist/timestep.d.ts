export interface IntegratorInterface {
    integrate(msInterval: number, accumulator: number): void;
    render(msInterval: number, remainderDelta: number): void;
    error(err: Error): void;
}
export interface TimestepInterface {
    start(): void;
    stop(): void;
}
export interface Params {
    integrator: IntegratorInterface;
    msMaxIntegration?: number;
    msInterval?: number;
}
export interface State {
    accumulator: number;
    msInterval: number;
    inverseInterval: number;
    msMaxIntegration: number;
    prevTimestamp: DOMHighResTimeStamp;
    receipt?: ReturnType<Window["requestAnimationFrame"]>;
}
export declare class Timestep implements TimestepInterface {
    #private;
    constructor(params: Params);
    start(): void;
    stop(): void;
}

export interface PipeFrictionParameters {
    rho: number;
    micro: number;
    d: number;
    v: number;
    epsilon: number;
}

export interface Point2D {
    x: number;
    y: number;
}

export interface IterativeValue {
    iteration: number;
    result: number;
    error: number;
}
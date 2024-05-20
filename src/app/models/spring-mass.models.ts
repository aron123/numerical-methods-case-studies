export interface Mass {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    text: string;
}

export interface Spring {
    mass1: Mass;
    mass2: Mass;
    stiffness: number;
    length: number;
    doubleSpring: boolean;
}

export interface SpringMassParameters {
    m1: number;
    m2: number;
    m3: number;
    k: number;
}
import { Injectable } from '@angular/core';
import { PipeFrictionParameters, Point2D } from '../models/pipe-friction.models';

@Injectable({
  providedIn: 'root'
})
export class PipeFrictionService {

  constructor() { }

  calculateReynolds(params: PipeFrictionParameters): number {
    return (params.rho * params.v * params.d) / params.micro;
  }

  colebrookFunction(params: PipeFrictionParameters, f: number): number {
    const { epsilon, d } = params;
    const re = this.calculateReynolds(params);

    return (1 / Math.sqrt(f)) + 2 * Math.log10(epsilon / (3.7 * d) + 2.51 / (re * Math.sqrt(f)));
  }

  calculatePlot(params: PipeFrictionParameters, lowerBound: number, higherBound: number, step: number = 0.001): Point2D[] {
    const result = [];
    
    for (let x = lowerBound; x <= higherBound; x += step) {
      result.push({ x, y: this.colebrookFunction(params, x) });
    }

    return result;
  }
}

import { Injectable } from '@angular/core';
import { IterativeValue, PipeFrictionParameters, Point2D } from '../models/pipe-friction.models';
import { Observable } from 'rxjs';

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

  colebrookDerivativeFunction(params: PipeFrictionParameters, f: number): number {
    const { epsilon, d } = params;
    const re = this.calculateReynolds(params);

    return -0.5 * Math.pow(f, -3 / 2) * (1 + 5.02 / Math.log(10) * (epsilon / (3.7 * d) + 2.51 / (re * Math.sqrt(f))) * epsilon);
  }

  calculatePlot(params: PipeFrictionParameters, lowerBound: number, higherBound: number, step: number = 0.001): Point2D[] {
    const result = [];

    for (let x = lowerBound; x <= higherBound; x += step) {
      result.push({ x, y: this.colebrookFunction(params, x) });
    }

    return result;
  }

  findRootBisection(func: (params: PipeFrictionParameters, x: number) => number, params: PipeFrictionParameters,
    lowerLimit: number, upperLimit: number, tolerance: number, maxIterations: number): Observable<IterativeValue> {
    return new Observable(subscriber => {
      let valueLower = func(params, lowerLimit);
      let valueUpper = func(params, upperLimit);

      if (valueLower * valueUpper >= 0) {
        return subscriber.error("A felező módszer nem alkalmazható, mert az intervallum határok azonos előjelűek.");
      }

      let iteration = 0;
      let value = 0;
      let result = 0;

      while (iteration < maxIterations) {
        iteration++;
        const prevApproximation = result;

        result = (lowerLimit + upperLimit) / 2;
        value = func(params, result);

        const error = Math.abs((result - prevApproximation) / result);

        subscriber.next({ iteration, result, error });

        if (Math.abs(value) < tolerance || (upperLimit - lowerLimit) / 2 < tolerance) {
          subscriber.complete();
        }

        if (valueLower * value < 0) {
          upperLimit = result;
          valueUpper = value;
        } else {
          lowerLimit = result;
          valueLower = value;
        }
      }

      subscriber.error(`${maxIterations} iteráció alatt nem sikerült megtalálni az egyenlet gyökét.`);
      subscriber.complete();
    });
  }

  findRootNewtonRaphson(func: (params: PipeFrictionParameters, x: number) => number,
    deriv: (params: PipeFrictionParameters, x: number) => number,
    params: PipeFrictionParameters, initialGuess: number, tolerance: number, maxIterations: number
  ): Observable<IterativeValue> {

    return new Observable(subscriber => {
      let x = initialGuess;
      let iteration = 0;
      let prevApproximation;

      while (iteration < maxIterations) {
        iteration++;

        prevApproximation = x;

        const fx = func(params, x);
        const dfx = deriv(params, x);

        x = x - fx / dfx;

        const error = Math.abs((x - prevApproximation) / x);

        if (Math.abs(fx) < tolerance) {
          subscriber.next({ iteration, result: x, error });
          return subscriber.complete();
        }

        if (dfx === 0) {
          subscriber.error(`A derivált értéke 0 az x = ${x} helyen, emiatt a módszer nem alkalmazható.`);
          return subscriber.complete();
        }

        subscriber.next({ iteration, result: x, error });
      }

      subscriber.error(`${maxIterations} iteráció alatt nem sikerült megtalálni az egyenlet gyökét.`);
    });
  }
}

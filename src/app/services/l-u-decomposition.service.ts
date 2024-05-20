import { Injectable } from '@angular/core';

@Injectable()
export class LUDecompositionService {
  private L: number[][];
  private U: number[][];

  constructor() {
    this.L = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    this.U = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
  }

  decompose(matrix: number[][]): void {
    for (let i = 0; i < 3; i++) {
      for (let k = i; k < 3; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += (this.L[i][j] * this.U[j][k]);
        }
        this.U[i][k] = matrix[i][k] - sum;
      }

      for (let k = i + 1; k < 3; k++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += (this.L[k][j] * this.U[j][i]);
        }
        this.L[k][i] = (matrix[k][i] - sum) / this.U[i][i];
      }
    }
  }

  getL(): number[][] {
    return this.L;
  }

  getU(): number[][] {
    return this.U;
  }

  solve(b: number[]): number[] {
    if (b.length !== 3) {
      throw new Error("Input vector b must have 3 elements");
    }

    // L*y = b
    let y = new Array(3).fill(0);
    for (let i = 0; i < 3; i++) {
      y[i] = b[i];
      for (let j = 0; j < i; j++) {
        y[i] -= this.L[i][j] * y[j];
      }
      y[i] /= this.L[i][i];
    }

    // U*x = y
    let x = new Array(3).fill(0);
    for (let i = 2; i >= 0; i--) {
      x[i] = y[i];
      for (let j = i + 1; j < 3; j++) {
        x[i] -= this.U[i][j] * x[j];
      }
      x[i] /= this.U[i][i];
    }

    return x;
  }
}

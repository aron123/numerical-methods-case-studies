import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LatexService {

  round(num: number, decimals: number = 2) {
    return Number.isInteger(num) ? num : Number.prototype.toFixed.call(num || 0, decimals);
  }

  toLaTeX(matrix: number[][]|string[][], w: number = 3, h: number = 3, decimals: number = 2) {
    const isString = typeof matrix[0][0] == 'string';

    let result = "\\begin{bmatrix}";

    for (let i = 0; i < h; i++) {
      if (i != 0) {
        result += " \\\\";
      }

      for (let j = 0; j < w; j++) {
        if (isString) {
          result += matrix[i][j];
        } else {
          result += (j == 0 ? ' ' : ' & ') + this.round((matrix as number[][])[i][j], decimals);
        }
      }
    }

    result += " \\end{bmatrix}";

    return result;
  }
}

import { Component, inject } from '@angular/core';
import { LUDecompositionService } from '../services/l-u-decomposition.service';
import { FlowExperimentData, RegressionResult } from '../models/flow-data.models';
import { FormsModule } from '@angular/forms';

import * as Plotly from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = Plotly;

@Component({
  selector: 'app-data-analysis',
  standalone: true,
  imports: [FormsModule, PlotlyModule],
  providers: [LUDecompositionService],
  templateUrl: './data-analysis.component.html',
  styleUrl: './data-analysis.component.css'
})
export class DataAnalysisComponent {
  luDecompositionService = inject(LUDecompositionService);

  experimentalData: FlowExperimentData[] = [
    { diameter: 1, slope: 0.001, flow: 1.4 },
    { diameter: 2, slope: 0.001, flow: 8.3 },
    { diameter: 3, slope: 0.001, flow: 24.2 },
    { diameter: 1, slope: 0.01, flow: 4.7 },
    { diameter: 2, slope: 0.01, flow: 28.9 },
    { diameter: 3, slope: 0.01, flow: 84 },
    { diameter: 1, slope: 0.05, flow: 11.1 },
    { diameter: 2, slope: 0.05, flow: 69 },
    { diameter: 3, slope: 0.05, flow: 200 },
  ]

  newData: FlowExperimentData = {
    diameter: 1,
    slope: 0.01,
    flow: 5.0
  }

  solution: RegressionResult = {
    a0: NaN,
    a1: NaN,
    a2: NaN
  };

  scatterData: Plotly.Data[] = [];
  scatterLayout: Partial<Plotly.Layout> = {};

  deleteRow(index: number) {
    if (index < 0 || index >= this.experimentalData.length) {
      return;
    }

    this.experimentalData.splice(index, 1);
  }

  addNewData() {
    this.experimentalData.push(Object.assign({}, this.newData));
  }

  sum(nums: number[]) {
    return nums.reduce((sum, value) => sum + value, 0);
  }

  calculateCoefficients() {
    const dataCount = this.experimentalData.length;
    const diameterLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.diameter)));
    const slopeLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.slope)));
    const diameterSquareLogSum = this.sum(this.experimentalData.map(data => Math.pow(Math.log10(data.diameter), 2)));
    const slopeSquareLogSum = this.sum(this.experimentalData.map(data => Math.pow(Math.log10(data.slope), 2)));
    const productLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.slope) * Math.log10(data.diameter), 2));

    const flowLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.flow)));
    const diameterFlowLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.diameter) * Math.log10(data.flow), 2));
    const slopeFlowLogSum = this.sum(this.experimentalData.map(data => Math.log10(data.slope) * Math.log10(data.flow), 2));

    const equationMatrix = [
      [dataCount, diameterLogSum, slopeLogSum],
      [diameterLogSum, diameterSquareLogSum, productLogSum],
      [slopeLogSum, productLogSum, slopeSquareLogSum]
    ];

    this.luDecompositionService.decompose(equationMatrix);

    const solution = this.luDecompositionService.solve([flowLogSum, diameterFlowLogSum, slopeFlowLogSum]);

    this.solution = {
      a0: Math.pow(10, solution[0]),
      a1: solution[1],
      a2: solution[2]
    };

    this.drawScatterPlot();
  }

  drawScatterPlot() {
    const xData = this.experimentalData.map(data => data.diameter);
    const yData = this.experimentalData.map(data => data.slope);
    const zData = this.experimentalData.map(data => data.flow);

    const scatterTrace: Plotly.Data = {
      x: xData,
      y: yData,
      z: zData,
      mode: 'markers',
      marker: {
        size: 5,
        color: 'blue'
      },
      type: 'scatter3d',
      name: 'Mérés'
    };

    const generateRegressionPlane = (xRange: number[], yRange: number[], func: (x: number, y: number) => number): Plotly.Data => {
      const xValues = [];
      const yValues = [];
      const zValues = [];
      const step = 0.01;

      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        for (let y = yRange[0]; y <= yRange[1]; y += step) {
          xValues.push(x);
          yValues.push(y);
          zValues.push(func(x, y));
        }
      }

      return {
        x: xValues,
        y: yValues,
        z: zValues,
        type: 'mesh3d',
        opacity: 0.5,
        marker: { color: 'red' },
        name: 'Regresszió'
      };
    };

    const regressionFunc = (diameter: number, slope: number) =>
      this.solution.a0 * Math.pow(diameter, this.solution.a1) * Math.pow(slope, this.solution.a2);

    const xRange = [0, [...xData].sort((a, b) => a - b)[xData.length - 1]];
    const yRange = [0, [...yData].sort((a, b) => a - b)[yData.length - 1]];

    const regressionPlaneTrace = generateRegressionPlane(xRange, yRange, regressionFunc);

    const data: Plotly.Data[] = [scatterTrace, regressionPlaneTrace];

    const layout: Partial<Plotly.Layout> = {
      title: 'Többszörös lineáris regresszió',
      scene: {
        xaxis: { title: 'Átmérő [ft]' },
        yaxis: { title: 'Meredekség [ft/ft]' },
        zaxis: { title: 'Térfogatáram [ft3/s]' },
        camera: {
          up: { x: 0, y: 0, z: 1 },
          center: {
              x: -0.06634,
              y: -0.02006,
              z: -0.10017
          },
          eye: {
              x: 1.65532,
              y: -1.31202,
              z: 0.19848
          }
        }
      },
      height: 800
    };

    this.scatterData = data;
    this.scatterLayout = layout;
  }

}

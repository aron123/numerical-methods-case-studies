import { Component, OnInit, inject } from '@angular/core';
import { LUDecompositionService } from '../services/l-u-decomposition.service';
import { FlowExperimentData, RegressionResult } from '../models/flow-data.models';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import * as Plotly from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { LatexComponent } from '../latex/latex.component';
import { LatexService } from '../services/latex.service';
PlotlyModule.plotlyjs = Plotly;

@Component({
  selector: 'app-data-analysis',
  standalone: true,
  imports: [FormsModule, PlotlyModule, ReactiveFormsModule, DecimalPipe, LatexComponent],
  providers: [LUDecompositionService],
  templateUrl: './data-analysis.component.html',
  styleUrl: './data-analysis.component.css'
})
export class DataAnalysisComponent implements OnInit {
  luDecompositionService = inject(LUDecompositionService);

  formBuilder = inject(FormBuilder);

  latexService = inject(LatexService);

  router = inject(Router);

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

  coefficientsMatrix: number[][] = [];
  resultMatrix: number[] = [];

  equationMatrixLatexString = '';
  solutionLatexString = '';

  solution: RegressionResult = {
    a0: NaN,
    a1: NaN,
    a2: NaN
  };

  resultCalculated = false;

  scatterData: Plotly.Data[] = [];
  scatterLayout: Partial<Plotly.Layout> = {};

  regressionForm = this.formBuilder.group<FlowExperimentData>({
    diameter: 2.5,
    slope: 0.025,
    flow: NaN
  });

  calculatedFlow = 0;

  ngOnInit(): void {
    this.regressionForm.valueChanges.subscribe(value => {
      const { diameter, slope } = value;

      if (isNaN(diameter!) || isNaN(slope!)) {
        return;
      }

      this.calculatedFlow = this.regression(diameter!, slope!);
    });
  }

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

    this.coefficientsMatrix = [
      [dataCount, diameterLogSum, slopeLogSum],
      [diameterLogSum, diameterSquareLogSum, productLogSum],
      [slopeLogSum, productLogSum, slopeSquareLogSum]
    ];

    this.resultMatrix = [flowLogSum, diameterFlowLogSum, slopeFlowLogSum];

    this.luDecompositionService.decompose(this.coefficientsMatrix);
    const solution = this.luDecompositionService.solve(this.resultMatrix);
    this.solution = {
      a0: Math.pow(10, solution[0]),
      a1: solution[1],
      a2: solution[2]
    };

    this.resultCalculated = true;

    this.equationMatrixLatexString = `$$ ${this.latexService.toLaTeX(this.coefficientsMatrix, 3, 3, 3)}`
      + `${this.latexService.toLaTeX([['log a_0'], ['a_1'], ['a_2']], 1, 3)}`
      + ` = `
      + `${this.latexService.toLaTeX([[this.resultMatrix[0]], [this.resultMatrix[1]], [this.resultMatrix[2]]], 1, 3, 3)} $$`;

    this.solutionLatexString = `$$ a_0 = ${this.latexService.round(this.solution.a0)}, `
      + `a_1 = ${this.latexService.round(this.solution.a1)}, a_2 = ${this.latexService.round(this.solution.a2)} $$`;

    this.drawScatterPlot();
    this.regressionForm.patchValue({});
    this.scrollTo('#results');
  }

  regression(diameter: number, slope: number): number {
    return this.solution.a0 * Math.pow(diameter, this.solution.a1) * Math.pow(slope, this.solution.a2);
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

    const xRange = [0, [...xData].sort((a, b) => a - b)[xData.length - 1]];
    const yRange = [0, [...yData].sort((a, b) => a - b)[yData.length - 1]];

    const regressionPlaneTrace = generateRegressionPlane(xRange, yRange, this.regression.bind(this));

    const data: Plotly.Data[] = [scatterTrace, regressionPlaneTrace];

    const layout: Partial<Plotly.Layout> = {
      title: 'Többszörös lineáris regresszió eredménye',
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

  scrollTo(id: string) {
    setTimeout(() => document.querySelector(id)?.scrollIntoView(), 200);
  }

  nextPage() {
    this.scrollTo('nav');
    this.router.navigateByUrl('contact');
  }
}

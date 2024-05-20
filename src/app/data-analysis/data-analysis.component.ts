import { Component, OnInit, inject } from '@angular/core';
import { LUDecompositionService } from '../services/l-u-decomposition.service';
import { FlowExperimentData } from '../models/flow-data.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-analysis',
  standalone: true,
  imports: [FormsModule],
  providers: [LUDecompositionService],
  templateUrl: './data-analysis.component.html',
  styleUrl: './data-analysis.component.css'
})
export class DataAnalysisComponent implements OnInit {
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

  solution = {
    a0: NaN,
    a1: NaN,
    a2: NaN
  };

  ngOnInit(): void {
    
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

    const equationMatrix = [
      [ dataCount, diameterLogSum, slopeLogSum ],
      [ diameterLogSum, diameterSquareLogSum, productLogSum ],
      [ slopeLogSum, productLogSum, slopeSquareLogSum ]
    ];

    this.luDecompositionService.decompose(equationMatrix);

    const solution = this.luDecompositionService.solve([ flowLogSum, diameterFlowLogSum, slopeFlowLogSum ]);

    this.solution = {
      a0: Math.pow(10, solution[0]),
      a1: solution[1],
      a2: solution[2]
    };
  }

}

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
}

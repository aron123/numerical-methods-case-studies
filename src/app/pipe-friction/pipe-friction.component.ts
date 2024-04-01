import { Component, inject } from '@angular/core';
import { LatexComponent } from '../latex/latex.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PipeFrictionParameters } from '../models/pipe-friction.models';
import { PipeFrictionService } from '../services/pipe-friction.service';
import { ApexAnnotations, ApexAxisChartSeries, ApexChart, ApexStroke, ApexXAxis, ApexYAxis, NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  annotations: ApexAnnotations;
  stroke: ApexStroke;
};

@Component({
  selector: 'app-pipe-friction',
  standalone: true,
  imports: [LatexComponent, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './pipe-friction.component.html',
  styleUrl: './pipe-friction.component.css'
})
export class PipeFrictionComponent {

  pipefrictionService = inject(PipeFrictionService);

  formBuilder = inject(FormBuilder);

  pipeFrictionForm = this.formBuilder.group<PipeFrictionParameters>({
    rho: 1.23,
    micro: 0.0000179,
    d: 0.005,
    v: 40,
    epsilon: 0.0000015
  });

  showResults = false;

  reynolds?: number;
  reynoldsFormula!: string;
  colebrookFormula!: string;

  chartOptions!: ChartOptions;

  calculate() {
    const params = this.pipeFrictionForm.value as PipeFrictionParameters;
    
    this.reynolds = this.pipefrictionService.calculateReynolds(params);
    this.reynoldsFormula = `$Re = \\frac{\\rho V D}{\\mu} = \\frac{${params.rho} \\cdot ${params.v} \\cdot ${params.d}}{${params.micro}} = ${this.reynolds.toFixed(4)}$`;
    this.colebrookFormula = `$g(f) = \\frac{1}{\\sqrt{f}} + 2.0 \\log \\left(\\frac{${params.epsilon}}{3.7 \\cdot ${params.d}} + \\frac{2.51}{${this.reynolds.toFixed(4)}\\sqrt{f}} \\right)$`;
    
    const plotValues = this.pipefrictionService.calculatePlot(params, 0.008, 0.8);
    
    this.chartOptions = {
      series: [
        {
          name: 'g(f)',
          data: plotValues.map(point => [ point.x, point.y ])
        }
      ],
      chart: { type: 'line', height: 400 },
      stroke: { curve: 'smooth' },
      xaxis: { type: 'numeric', decimalsInFloat: 4, title: { text: 'f' } },
      yaxis: { decimalsInFloat: 4, title: { text: 'g(f)' } },
      annotations: { yaxis: [{ y: 0, borderColor: 'red', borderWidth: 3 }] } 
    }

    this.showResults = true;
    
    this.scrollToResults();
  }

  scrollToResults() {
    setTimeout(() => document.querySelector('#result')?.scrollIntoView(), 200);
  }
}

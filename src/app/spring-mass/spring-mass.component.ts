import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { LatexComponent } from '../latex/latex.component';
import { LUDecompositionService } from '../services/l-u-decomposition.service';
import { Mass, Spring, SpringMassParameters } from '../models/spring-mass.models';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-spring-mass',
  standalone: true,
  imports: [ReactiveFormsModule, LatexComponent],
  providers: [LUDecompositionService],
  templateUrl: './spring-mass.component.html',
  styleUrl: './spring-mass.component.css'
})
export class SpringMassComponent implements AfterViewInit {
  luDecompositionService = inject(LUDecompositionService);

  formBuilder = inject(FormBuilder);

  springMassForm = this.formBuilder.group<SpringMassParameters>({
    m1: 2,
    m2: 3,
    m3: 2.5,
    k: 10
  });

  luDecompositionEquation = '';
  equationSystemSolution = '';

  @ViewChild('figure')
  canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D;

  masses: Mass[] = [
    { x: 100, y: 0, width: 75, height: 0, color: 'white', text: '' },
    { x: 100, y: 50, width: 75, height: 50, color: '#55cbcd', text: 'm₁' },
    { x: 100, y: 160, width: 75, height: 50, color: '#97c1a9', text: 'm₂' },
    { x: 100, y: 270, width: 75, height: 50, color: '#cbaacb', text: 'm₃' },

    { x: 400, y: 0, width: 75, height: 0, color: 'white', text: '' },
    { x: 400, y: 100, width: 75, height: 50, color: '#55cbcd', text: 'm₁' },
    { x: 400, y: 250, width: 75, height: 50, color: '#97c1a9', text: 'm₂' },
    { x: 400, y: 400, width: 75, height: 50, color: '#cbaacb', text: 'm₃' }
  ];

  springs: Spring[] = [
    { mass1: this.masses[0], mass2: this.masses[1], stiffness: 0.1, length: 200, doubleSpring: false },
    { mass1: this.masses[1], mass2: this.masses[2], stiffness: 0.1, length: 200, doubleSpring: true },
    { mass1: this.masses[2], mass2: this.masses[3], stiffness: 0.1, length: 200, doubleSpring: false },

    { mass1: this.masses[4], mass2: this.masses[5], stiffness: 0.1, length: 200, doubleSpring: false },
    { mass1: this.masses[5], mass2: this.masses[6], stiffness: 0.1, length: 200, doubleSpring: true },
    { mass1: this.masses[6], mass2: this.masses[7], stiffness: 0.1, length: 200, doubleSpring: false }
  ];

  direction = 1;

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
  }

  round(num: number, decimals: number = 2) {
    return Number.isInteger(num) ? num : Number.prototype.toFixed.call(num || 0, decimals);
  }

  toLaTeX(matrix: number[][], w: number = 3, h: number = 3, decimals: number = 2) {
    let result = "\\begin{bmatrix}";

    for (let i = 0; i < h; i++) {
      if (i != 0) {
        result += " \\\\";
      }

      for (let j = 0; j < w; j++) {
        result += (j == 0 ? ' ' : ' & ') + this.round(matrix[i][j], decimals);
      }
    }

    result += " \\end{bmatrix}";

    return result;
  }

  calculateEquation() {
    const { m1, m2, m3, k } = this.springMassForm.value as SpringMassParameters;
    const g = 9.81;

    const inputMatrix = [
      [3 * k, -2 * k, 0],
      [-2 * k, 3 * k, -1 * k],
      [0, -1 * k, k]
    ]

    this.luDecompositionService.decompose(inputMatrix);
    this.luDecompositionEquation = `$$ ${this.toLaTeX(inputMatrix)} = ${this.toLaTeX(this.luDecompositionService.getL())} \\cdot ${this.toLaTeX(this.luDecompositionService.getU())} $$`;
  
    const solution = this.luDecompositionService.solve([m1 * g, m2 * g, m3 * g]);
    this.equationSystemSolution = `$$ x_1 = ${this.round(solution[0])}, x_2 = ${this.round(solution[1])}, x_3 = ${this.round(solution[2])} $$`;
  
    this.draw(solution[0], solution[1], solution[2]);

    this.scrollTo('#results');
  }

  drawDashedLine(mass: Mass) {
    this.context.beginPath();
    this.context.setLineDash([15, 5]);
    this.context.moveTo(0, mass.y);
    this.context.lineTo(this.canvas.nativeElement.width, mass.y);
    this.context.strokeStyle = mass.color;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]);
    this.context.closePath();
  }

  drawMass(mass: Mass) {
    this.context.fillStyle = mass.color;
    this.context.fillRect(mass.x, mass.y, mass.width, mass.height);

    this.context.fillStyle = 'white';
    this.context.font = '16px Arial';

    const centerX = mass.x + mass.width / 2;
    const centerY = mass.y + mass.height / 2;
    const textMetrics = this.context.measureText(mass.text);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    this.context.fillText(mass.text, centerX - textWidth / 2, centerY + textHeight / 2);
  }

  drawArrow(mass1: Mass, mass2: Mass, text: string, x: number) {
    const fromx = x;
    const tox = x;
    const fromy = mass1.y;
    const toy = mass2.y;

    const headlen = 10;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);

    this.context.beginPath();
    this.context.moveTo(fromx, fromy);
    this.context.lineTo(tox, toy);
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 2;
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(tox, toy);
    this.context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    this.context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    this.context.lineTo(tox, toy);
    this.context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.fillStyle = 'red';
    this.context.fill();

    const centerX = (fromx + tox) / 2;
    const centerY = (fromy + toy) / 2;
    this.context.fillStyle = 'black';
    this.context.font = '16px Arial';
    this.context.fillText(text, centerX + 5, centerY - 5);
  }

  drawSpring(spring: Spring) {
    const { mass1, mass2 } = spring;
    const numZigs = 10;
    const dy = (mass2.y - mass1.y) / numZigs;
    const amplitude = 10;

    let offsets = [];
    if (spring.doubleSpring) {
      offsets = [-20, 20];
    } else {
      offsets = [0]
    }

    for (const offset of offsets) {
      this.context.beginPath();
      this.context.moveTo(mass1.x + mass1.width / 2 + offset, mass1.y + mass1.height / 2);

      for (let i = 1; i < numZigs; i++) {
        const x = mass1.x + offset + mass1.width / 2 + (i % 2 === 0 ? amplitude : -amplitude);
        const y = mass1.y + i * dy + mass1.height / 2;
        this.context.lineTo(x, y);
      }

      this.context.lineTo(mass2.x + mass2.width / 2 + offset, mass2.y + mass2.height / 2);
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();
    }
  }

  draw(x1: number, x2: number, x3: number) {
    const scale = 20;
    this.masses[5].y = this.masses[1].y + x1 * scale;
    this.masses[6].y = this.masses[2].y + x2 * scale;
    this.masses[7].y = this.masses[3].y + x3 * scale;

    const lastMass = this.masses[this.masses.length - 1];
    this.canvas.nativeElement.height = lastMass.y + lastMass.height;

    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.springs.forEach(this.drawSpring.bind(this));
    this.masses.forEach(this.drawDashedLine.bind(this));
    this.masses.forEach(this.drawMass.bind(this));

    this.drawArrow(this.masses[1], this.masses[5], `x₁ = ${this.round(x1)}`, 520);
    this.drawArrow(this.masses[2], this.masses[6], `x₂ = ${this.round(x2)}`, 620);
    this.drawArrow(this.masses[3], this.masses[7], `x₃ = ${this.round(x3)}`, 710);
  }

  scrollTo(id: string) {
    setTimeout(() => document.querySelector(id)?.scrollIntoView(), 200);
  }
}

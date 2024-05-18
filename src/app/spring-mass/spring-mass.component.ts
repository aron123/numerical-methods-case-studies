import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { LatexComponent } from '../latex/latex.component';
import { LUDecompositionService } from '../services/l-u-decomposition.service';

interface Mass {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Spring {
  mass1: Mass;
  mass2: Mass;
  stiffness: number;
  length: number;
}

@Component({
  selector: 'app-spring-mass',
  standalone: true,
  imports: [LatexComponent],
  templateUrl: './spring-mass.component.html',
  styleUrl: './spring-mass.component.css'
})
export class SpringMassComponent implements AfterViewInit {
  luDecompositionService = inject(LUDecompositionService);

  @ViewChild('figure')
  canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D;

  masses: Mass[] = [
    { x: 100, y: 100, width: 75, height: 50, color: 'red' },
    { x: 100, y: 250, width: 75, height: 50, color: 'green' },
    { x: 100, y: 400, width: 75, height: 50, color: 'blue' },
    { x: 400, y: 100, width: 75, height: 50, color: 'red' },
    { x: 400, y: 350, width: 75, height: 50, color: 'green' },
    { x: 400, y: 650, width: 75, height: 50, color: 'blue' }
  ];

  springs: Spring[] = [
    { mass1: this.masses[0], mass2: this.masses[1], stiffness: 0.1, length: 200},
    { mass1: this.masses[1], mass2: this.masses[2], stiffness: 0.1, length: 200},
    { mass1: this.masses[3], mass2: this.masses[4], stiffness: 0.1, length: 200},
    { mass1: this.masses[4], mass2: this.masses[5], stiffness: 0.1, length: 200}
  ];

  direction = 1;

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;

    this.draw();
  }

  calculateEquation() {
    const inputMatrix = [
      [30, -20, 0],
      [-20, 30, -10],
      [0, -10, 10]
    ]

    this.luDecompositionService.decompose(inputMatrix);

    console.log('L', this.luDecompositionService.getL());
    console.log('U', this.luDecompositionService.getU());

    const solution = this.luDecompositionService.solve([19.62, 29.43, 24.525]);
    console.log('solution', solution);
  }

  drawMass(mass: Mass) {
    this.context.fillStyle = mass.color;
    this.context.fillRect(mass.x, mass.y, mass.width, mass.height);
  }

  drawSpring(spring: Spring) {
    const { mass1, mass2 } = spring;
    const numZigs = 10;
    const dy = (mass2.y - mass1.y) / numZigs;
    const amplitude = 10;

    this.context.beginPath();
    this.context.moveTo(mass1.x + mass1.width / 2, mass1.y + mass1.height / 2);

    for (let i = 1; i < numZigs; i++) {
      const x = mass1.x + mass1.width / 2 + (i % 2 === 0 ? amplitude : -amplitude);
      const y = mass1.y + i * dy + mass1.height / 2;
      this.context.lineTo(x, y);
    }

    this.context.lineTo(mass2.x + mass2.width / 2, mass2.y + mass2.height / 2);
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.springs.forEach(this.drawSpring.bind(this));
    this.masses.forEach(this.drawMass.bind(this));

    requestAnimationFrame(this.draw.bind(this));
}
}

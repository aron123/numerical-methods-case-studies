import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { LatexComponent } from '../latex/latex.component';
import { LUDecompositionService } from '../services/l-u-decomposition.service';

interface Mass {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
}

interface Spring {
  mass1: Mass;
  mass2: Mass;
  stiffness: number;
  length: number;
  doubleSpring: boolean;
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

    this.context.beginPath();
    this.context.setLineDash([15, 5]);
    this.context.moveTo(0, mass.y);
    this.context.lineTo(this.canvas.nativeElement.width, mass.y);
    this.context.strokeStyle = mass.color;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]);
    this.context.closePath();

    this.context.fillStyle = 'white';
    this.context.font = '16px Arial';

    const centerX = mass.x + mass.width / 2;
    const centerY = mass.y + mass.height / 2;
    const textMetrics = this.context.measureText(mass.text);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    this.context.fillText(mass.text, centerX - textWidth / 2, centerY + textHeight / 2);
  }

  drawArrow(mass1: Mass, mass2: Mass, text: string) {
    const fromx = 700;
    const tox = 700;
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
      offsets = [ -20, 20 ];
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

  draw() {
    const lastMass = this.masses[this.masses.length - 1];
    this.canvas.nativeElement.height = lastMass.y + lastMass.height;

    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.springs.forEach(this.drawSpring.bind(this));
    this.masses.forEach(this.drawMass.bind(this));

    this.drawArrow(this.masses[1], this.masses[5], 'x₁');
    this.drawArrow(this.masses[2], this.masses[6], 'x₂');
    this.drawArrow(this.masses[3], this.masses[7], 'x₃');
  }
}

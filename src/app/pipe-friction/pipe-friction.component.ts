import { Component } from '@angular/core';
import { LatexComponent } from '../latex/latex.component';

@Component({
  selector: 'app-pipe-friction',
  standalone: true,
  imports: [ LatexComponent ],
  templateUrl: './pipe-friction.component.html',
  styleUrl: './pipe-friction.component.css'
})
export class PipeFrictionComponent {

}

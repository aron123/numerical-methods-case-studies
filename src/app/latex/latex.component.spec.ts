import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatexFormulaComponent } from './latex-formula.component';

describe('LatexFormulaComponent', () => {
  let component: LatexFormulaComponent;
  let fixture: ComponentFixture<LatexFormulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatexFormulaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LatexFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

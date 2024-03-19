import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeFrictionComponent } from './pipe-friction.component';

describe('PipeFrictionComponent', () => {
  let component: PipeFrictionComponent;
  let fixture: ComponentFixture<PipeFrictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipeFrictionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PipeFrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

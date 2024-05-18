import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpringMassComponent } from './spring-mass.component';

describe('SpringMassComponent', () => {
  let component: SpringMassComponent;
  let fixture: ComponentFixture<SpringMassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpringMassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpringMassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

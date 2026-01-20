import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {DietitianDashboardComponent} from './dietitian-dashboard.component';

describe('DietitianDashboardComponent', () => {
  let component: DietitianDashboardComponent;
  let fixture: ComponentFixture<DietitianDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianDashboardComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

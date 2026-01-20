import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {MeasurementChartCardComponent} from './measurement-chart-card.component';

describe('MeasurementChartCardComponent', () => {
  let component: MeasurementChartCardComponent;
  let fixture: ComponentFixture<MeasurementChartCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementChartCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeasurementChartCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('measurementType', {
      key: 'weight',
      label: 'Weight',
      unit: 'kg'
    });
    fixture.componentRef.setInput('measurementHistory', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

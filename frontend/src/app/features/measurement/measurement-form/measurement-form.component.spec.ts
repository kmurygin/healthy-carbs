import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import {MeasurementFormComponent} from './measurement-form.component';

describe('MeasurementFormComponent', () => {
  let component: MeasurementFormComponent;
  let fixture: ComponentFixture<MeasurementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeasurementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

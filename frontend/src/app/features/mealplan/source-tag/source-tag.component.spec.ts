import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {SourceTagComponent} from './source-tag.component';
import {MealPlanSource} from "@core/models/enum/mealplan-source.enum";

describe('SourceTagComponent', () => {
  let component: SourceTagComponent;
  let fixture: ComponentFixture<SourceTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceTagComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SourceTagComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('source', MealPlanSource.GENERATED);
    fixture.detectChanges();
  });

  it('component_whenCreated_shouldBeTruthy', () => {
    expect(component).toBeTruthy();
  });

  it('styles_whenSourceChanges_shouldUpdateLabelAndIcon', () => {
    fixture.componentRef.setInput('source', MealPlanSource.GENERATED);
    fixture.detectChanges();
    expect(component.styles().label).toBe('Generated');
    expect(component.styles().icon).toContain('fa-robot');

    fixture.componentRef.setInput('source', MealPlanSource.DIETITIAN);
    fixture.detectChanges();
    expect(component.styles().label).toBe('Dietitian');
    expect(component.styles().icon).toContain('fa-user');
  });
});

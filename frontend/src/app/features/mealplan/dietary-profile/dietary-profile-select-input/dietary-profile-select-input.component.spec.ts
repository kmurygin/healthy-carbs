import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {DietaryProfileSelectInputComponent} from './dietary-profile-select-input.component';

describe('DietaryProfileSelectInputComponent', () => {
  let component: DietaryProfileSelectInputComponent;
  let fixture: ComponentFixture<DietaryProfileSelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietaryProfileSelectInputComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietaryProfileSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

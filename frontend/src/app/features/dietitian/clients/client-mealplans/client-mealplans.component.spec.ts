import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {ClientMealPlansComponent} from './client-mealplans.component';

describe('ClientMealplansComponent', () => {
  let component: ClientMealPlansComponent;
  let fixture: ComponentFixture<ClientMealPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMealPlansComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientMealPlansComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clientId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

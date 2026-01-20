import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {ClientCardComponent} from './client-card.component';

describe('ClientCardComponent', () => {
  let component: ClientCardComponent;
  let fixture: ComponentFixture<ClientCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCardComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('client', {
      id: '1',
      userId: 'u1',
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@test.com',
      age: 30,
      gender: 'MALE',
      height: 180,
      weight: 80,
      activityLevel: 'MODERATE',
      goal: 'MAINTAIN',
      dietType: 'VEGAN',
      calories: 2500,
      carbs: 300,
      protein: 150,
      fat: 80
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

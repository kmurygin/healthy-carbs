import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import {IngredientsManagementComponent} from './ingredients-management.component';

describe('IngredientsManagementComponent', () => {
  let component: IngredientsManagementComponent;
  let fixture: ComponentFixture<IngredientsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsManagementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

import {RecipesManagementComponent} from './recipes-management.component';

describe('RecipesManagementComponent', () => {
  let component: RecipesManagementComponent;
  let fixture: ComponentFixture<RecipesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesManagementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RecipesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

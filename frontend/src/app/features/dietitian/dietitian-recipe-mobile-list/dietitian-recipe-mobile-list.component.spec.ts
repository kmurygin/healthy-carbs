import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {DietitianRecipeMobileListComponent} from './dietitian-recipe-mobile-list.component';

describe('DietitianRecipeMobileListComponent', () => {
  let component: DietitianRecipeMobileListComponent;
  let fixture: ComponentFixture<DietitianRecipeMobileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianRecipeMobileListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianRecipeMobileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

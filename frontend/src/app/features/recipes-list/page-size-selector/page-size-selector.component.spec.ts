import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';

import {PageSizeSelectorComponent} from './page-size-selector.component';

describe('PageSizeSelectorComponent', () => {
  let component: PageSizeSelectorComponent;
  let fixture: ComponentFixture<PageSizeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSizeSelectorComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PageSizeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

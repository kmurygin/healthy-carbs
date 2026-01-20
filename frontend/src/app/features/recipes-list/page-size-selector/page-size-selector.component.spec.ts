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
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageSizeOptions', [10, 20, 50]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

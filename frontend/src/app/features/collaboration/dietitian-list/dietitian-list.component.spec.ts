import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {DietitianListComponent} from './dietitian-list.component';

describe('DietitianListComponent', () => {
  let component: DietitianListComponent;
  let fixture: ComponentFixture<DietitianListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietitianListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DietitianListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

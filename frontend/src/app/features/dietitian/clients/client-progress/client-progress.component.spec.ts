import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {ClientProgressComponent} from './client-progress.component';

describe('ClientProgressComponent', () => {
  let component: ClientProgressComponent;
  let fixture: ComponentFixture<ClientProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProgressComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClientProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

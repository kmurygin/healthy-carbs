import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {AbstractInputComponent} from './abstract-input.component';
import {NgControl} from '@angular/forms';
import {vi} from 'vitest'

@Component({
  selector: 'app-test-input',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NgControl, useValue: {
        control: {
          statusChanges: {
            subscribe: vi.fn()
          }
        }
      }
    }
  ]
})
class TestInputComponent extends AbstractInputComponent<string> {
  override get errorMessage(): string {
    return 'Error message';
  }
}

describe('AbstractInputComponent', () => {
  let component: TestInputComponent;
  let fixture: ComponentFixture<TestInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {type ComponentFixture, TestBed} from '@angular/core/testing';

import {UserRoleTagComponent} from './user-role-tag.component';

describe('UserRoleTagComponent', () => {
  let component: UserRoleTagComponent;
  let fixture: ComponentFixture<UserRoleTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleTagComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserRoleTagComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create component instance successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should display role badge when selectedRole is AUTHOR', () => {
      fixture.componentRef.setInput('selectedRole', 'AUTHOR');
      fixture.detectChanges();

      const hostElement = fixture.nativeElement as HTMLElement;
      const badge = hostElement.querySelector('.text-indigo-800');
      expect(badge).toBeTruthy();
    });

    it('should display role badge when selectedRole is DIETITIAN', () => {
      fixture.componentRef.setInput('selectedRole', 'DIETITIAN');
      fixture.detectChanges();

      const hostElement = fixture.nativeElement as HTMLElement;
      const badge = hostElement.querySelector('.text-emerald-800');
      expect(badge).toBeTruthy();
    });

    it('should display correct label text for role', () => {
      fixture.componentRef.setInput('selectedRole', 'AUTHOR');
      fixture.detectChanges();

      const hostElement = fixture.nativeElement as HTMLElement;
      expect(hostElement.textContent).toContain('Author');
    });
  });
});

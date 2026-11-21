import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const authMock = {
    isLoggedIn: vi.fn(),
    setToken: vi.fn(),
  };
  const apiMock = {
    login: vi.fn(),
  };
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    authMock.isLoggedIn.mockReturnValue(false);
    authMock.setToken.mockReset();
    apiMock.login.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: ApiService, useValue: apiMock },
        provideRouter([]),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('does not call login when a field is empty', () => {
    component.form.setValue({ username: '', password: 'Password123!' });
    component.submit();

    expect(apiMock.login).not.toHaveBeenCalled();
    expect(component.error()).toBeTruthy();
  });

  it('saves the session and opens the admin page on success', () => {
    apiMock.login.mockReturnValue(of({ token: 'test-token' }));

    component.form.setValue({
      username: 'manager',
      password: 'Password123!',
    });
    component.submit();

    expect(apiMock.login).toHaveBeenCalledWith('manager', 'Password123!');
    expect(authMock.setToken).toHaveBeenCalledWith('test-token');
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('shows the API error and stops the loading state', () => {
    const errorResponse = new HttpErrorResponse({
      status: 401,
      error: { message: 'Invalid username or password' },
    });
    apiMock.login.mockReturnValue(throwError(() => errorResponse));

    component.form.setValue({
      username: 'manager',
      password: 'wrong-password',
    });
    component.submit();

    expect(component.error()).toBeTruthy();
    expect(component.submitting()).toBe(false);
    expect(authMock.setToken).not.toHaveBeenCalled();
  });
});

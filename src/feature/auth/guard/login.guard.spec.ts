import { Test, TestingModule } from '@nestjs/testing';
import { LoginGuard } from './login.guard';

describe('LoginGuard', () => {
  let guard: LoginGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginGuard],
    }).compile();

    guard = module.get<LoginGuard>(LoginGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should activate', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          session: { loggedIn: true }
        }),
      }),
    } as any;

    expect(guard.canActivate(ctx)).toBeTruthy();
  });

  it('should not activate', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          session: { loggedIn: false }
        }),
      }),
    } as any;

    expect(guard.canActivate(ctx)).toBeFalsy();
  });
});

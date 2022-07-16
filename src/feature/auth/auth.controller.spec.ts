import { Test, TestingModule } from '@nestjs/testing';
import { EventGateway } from '../event/event.gateway';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginFailedException } from './exception/login-failed.exception';
import { SessionSaltNotExistedException } from './exception/session-salt-not-existed.exception';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn((username, hashedPassword, _) => {
        if (username == 'someone' && hashedPassword == 'correct') return { username };
        return null;
      }),
      generateSessionSalt: jest.fn(() => 'new_salt'),
    };
    const mockEventGateway = {
      disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: EventGateway, useValue: mockEventGateway },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login successfully', async () => {
    const sess = { salt: 'salt', username: undefined, loggedIn: false };
    const payload = { username: 'someone', password: 'correct' };

    const { user } = await controller.login(sess, payload);
    expect(user.username).toBe(payload.username);
    expect(sess.salt).toBe('new_salt');
    expect(sess.username).toBe(payload.username);
    expect(sess.loggedIn).toBeTruthy();
  });

  it('should throw an error because of wrong password', async () => {
    const sess = { salt: 'salt', username: undefined, loggedIn: false };
    const payload = { username: 'someone', password: 'wrong' };

    expect(controller.login(sess, payload)).rejects.toThrow(LoginFailedException);
  });

  it('should throw an error when session was uninitialized', async () => {
    const sess = {} as any;
    const payload = { username: 'someone', password: 'correct' };

    expect(controller.login(sess, payload)).rejects.toThrow(SessionSaltNotExistedException);
  });

  it('should logout successfully', async () => {
    const sess = { salt: 'salt', username: 'someone', loggedIn: true };

    expect(controller.logout(sess)).resolves.not.toThrow();
    expect(sess.salt).toBe('salt');
    expect(sess.username).toBeUndefined();
    expect(sess.loggedIn).toBeFalsy();
  });
});

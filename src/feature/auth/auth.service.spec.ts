import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const mockUser = {
      id: 1,
      username: 'someone',
      password: '$2b$10$2a59d59e3809f827ce709Ockb8z9svfUE5VJRMogvGD8vE9Y/dssW',
    };
    const mockUserService = {
      findOne: jest.fn(username => {
        if (username == 'someone') return mockUser;
        else return null;
      }),
    };
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user object', async () => {
    const username = 'someone';
    const hashedPassword = '$2b$10$KgDwJ09zsQKOWZyiYXZgM.2sira1NnQ7DJ7NUsXN44qN4tMsCrqUG';
    const salt = '$2b$10$KgDwJ09zsQKOWZyiYXZgM.';

    const user = await service.validateUser(username, hashedPassword, salt);
    expect(user.username).toBe(username);
  });

  it('should return null when username is wrong', async () => {
    const username = 'not_exist';
    const hashedPassword = '$2b$10$KgDwJ09zsQKOWZyiYXZgM.2sira1NnQ7DJ7NUsXN44qN4tMsCrqUG';
    const salt = '$2b$10$KgDwJ09zsQKOWZyiYXZgM.';

    const user = await service.validateUser(username, hashedPassword, salt);
    expect(user).toBeNull();
  });

  it('should return null when password is wrong', async () => {
    const username = 'someone';
    const hashedPassword = '$2b$10$K87wJ09zsQKOWZyiYXZgM.2sira1NnQ7DJ7NUsXN44qN4tMsCrqUG';
    const salt = '$2b$10$K87wJ09zsQKOWZyiYXZgM.';

    const user = await service.validateUser(username, hashedPassword, salt);
    expect(user).toBeNull();
  });
});

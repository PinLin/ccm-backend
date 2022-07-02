import { Test, TestingModule } from '@nestjs/testing';
import { UserExistedException } from './exception/user-existed.exception';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(dto => dto.username != 'someone' ? { ...dto, id: 2 } : null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = { username: 'newone', secret: 'dontcare' };

    const user = await controller.createUser(dto);
    expect(user.username).toBe(dto.username);
  });

  it('should throw an error when creating a existed user', async () => {
    const dto = { username: 'someone', secret: 'dontcare' };

    expect(controller.createUser(dto)).rejects.toThrow(UserExistedException);
  });
});

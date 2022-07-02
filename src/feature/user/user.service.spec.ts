import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await userRepository.save(userRepository.create({
      username: 'someone',
      password: 'dontcare',
      nickname: 'dontcare',
      avatar: 'dontcare',
    }));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = { username: 'newone', secret: 'correct' };

    const user = await service.create(dto);
    expect(user.username).toBe(dto.username);
    expect(await Bcrypt.verify(user.password, dto.secret)).toBeTruthy();
  });

  it('should return null when creating a existed user', async () => {
    const dto = { username: 'someone', secret: 'dontcare' };

    const user = await service.create(dto);
    expect(user).toBeNull();
  });
});

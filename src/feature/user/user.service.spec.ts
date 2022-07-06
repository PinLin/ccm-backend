import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Bcrypt } from '../../utility/bcrypt.utility';
import { Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UserService } from './user.service';
import { SHA256 } from '../../utility/sha256.utility';
import { AES } from '../../utility/aes.utility';
import { Ecies } from '../../utility/ecies.utility';

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
      publicKey: 'dontcare',
      encryptedPrivateKey: 'dontcare',
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
    const publicKey = user.publicKey;
    const plaintext = 'test';
    const ciphertext = await Ecies.encrypt(publicKey, plaintext)
    const aesKey = SHA256.hash(dto.secret).slice(0, 32);
    const aesIv = SHA256.hash(dto.username).slice(0, 16);
    const privateKey = AES.decrypt(user.encryptedPrivateKey, aesKey, aesIv);
    expect(await Ecies.decrypt(privateKey, ciphertext)).toBe(plaintext);
  });

  it('should return null when creating a existed user', async () => {
    const dto = { username: 'someone', secret: 'dontcare' };

    const user = await service.create(dto);
    expect(user).toBeNull();
  });

  it('should find the user by username', async () => {
    const username = 'someone';

    const user = await service.findOne(username);
    expect(user.username).toBe(username);
  });

  it('should return null when finding a existed user', async () => {
    const username = 'not_existed';

    const user = await service.findOne(username);
    expect(user).toBeNull();
  });

  it('should delete the specific user', async () => {
    const username = 'someone';

    const result = await service.delete(username);
    expect(result).toBeTruthy();
  });
});

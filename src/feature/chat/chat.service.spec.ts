import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMember } from '../../entity/chat-member.entity';
import { Chat } from '../../entity/chat.entity';
import { Message } from '../../entity/message.entity';
import { User } from '../../entity/user.entity';
import { ChatService } from './chat.service';
import { MessageType } from './enum/message.enum';

describe('ChatService', () => {
  let service: ChatService;
  let userRepository: Repository<User>;
  let chatRepository: Repository<Chat>;
  let chatMemberRepository: Repository<ChatMember>;
  let messageRepository: Repository<Message>;

  let user1: User;
  let user2: User;
  let user3: User;
  let chat1: Chat;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Chat, ChatMember, User, Message]),
      ],
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    user1 = userRepository.create({
      username: 'user1',
      password: 'dontcare',
      nickname: 'dontcare',
      avatar: 'dontcare',
      publicKey: '048fc663ad0bc73c287809ccd8d1e6d8595a173ba63d0e50a743cf95eca7440f529e532ac0d0312b23f64662f108f65367a3eb29c9848787ad2ae7e9e36db5e1ec',
      encryptedPrivateKey: 'dontcare',
    });
    user2 = userRepository.create({
      username: 'user2',
      password: 'dontcare',
      nickname: 'dontcare',
      avatar: 'dontcare',
      publicKey: '04776017e6ca13955312465774b56f678c67c7c234ad32485366b733efc92a45afc7b2de957bd4d3a474bf08442e6a4160d3e6d0be1ba9666fd891a2a0be76dc24',
      encryptedPrivateKey: 'dontcare',
    });
    user3 = userRepository.create({
      username: 'user3',
      password: 'dontcare',
      nickname: 'dontcare',
      avatar: 'dontcare',
      publicKey: '04d9a67590539ac84471b69164ed9bb06ddb13a2b99ae0a0115f1c18336839a0cf4deccdf75983a9c71d88cd7b8500671c94c51ac9758d52c4690ff978cb528cc2',
      encryptedPrivateKey: 'dontcare',
    });
    await userRepository.save([user1, user2, user3]);

    chatRepository = module.get<Repository<Chat>>(getRepositoryToken(Chat));
    chatMemberRepository = module.get<Repository<ChatMember>>(getRepositoryToken(ChatMember));
    chat1 = chatRepository.create();
    chat1.members = [
      chatMemberRepository.create({
        userId: user1.id,
        encryptedMessageKey: 'dontcare',
      }),
      chatMemberRepository.create({
        userId: user2.id,
        encryptedMessageKey: 'dontcare',
      }),
    ];
    await chatRepository.save(chat1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a chat', async () => {
    const chat = await service.createChat(user1.id, user1.publicKey, user3.id, user3.publicKey);
    expect(chat.id).toBe(2);
  });

  it('should return a chat', async () => {
    const chat = await service.findChatByUserIds(user1.id, user2.id);
    expect(chat.id).toBe(1);
  });

  it('should return null when finding a non-existed chat', async () => {
    const chat = await service.findChatByUserIds(user1.id, user3.id);
    expect(chat).toBeNull();
  });

  it('should return null when finding a self chat', async () => {
    const chat = await service.findChatByUserIds(user1.id, user1.id);
    expect(chat).toBeNull();
  });

  it('should return an array of chats', async () => {
    const chats = await service.findAllChats(user1.id);
    expect(chats).toHaveLength(1);
  });

  it('should return an empty array of chats', async () => {
    const chats = await service.findAllChats(user3.id);
    expect(chats).toHaveLength(0);
  });

  it('should send a message', async () => {
    const payload = { type: MessageType.Text, content: 'test' };

    const message = await service.sendMessage(chat1.id, user1.id, payload);
    expect(message.type).toBe(payload.type);
    expect(message.content).toBe(payload.content);
  });
});

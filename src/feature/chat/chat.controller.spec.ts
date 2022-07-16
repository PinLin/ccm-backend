import { Test, TestingModule } from '@nestjs/testing';
import { UserNotExistedException } from '../user/exception/user-not-existed.exception';
import { UserService } from '../user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatExistedException } from './exception/chat-existed.exception';
import { CreateSelfChatException } from './exception/create-self-chat.exception';

describe('ChatController', () => {
  let controller: ChatController;

  const mockChatService = {
    createChat: jest.fn((ownerId, _1, guestId, _2) => {
      return {
        id: 2,
        members: [
          { userId: ownerId, encryptedMessageKey: 'encryptedMessageKey' },
          { userId: guestId, encryptedMessageKey: 'encryptedMessageKey' },
        ],
      };
    }),
    findChatByUserIds: jest.fn((userId1, userId2) => {
      if (userId1 == 1 && userId2 == 2) return {
        id: 1,
        members: [
          { userId: 1, encryptedMessageKey: 'encryptedMessageKey' },
          { userId: 2, encryptedMessageKey: 'encryptedMessageKey' },
        ],
      };
      return null;
    }),
  };
  const mockUserService = {
    findOneByUsername: jest.fn(username => {
      if (username == 'user1') return { id: 1, username: 'user1' };
      if (username == 'user2') return { id: 2, username: 'user2' };
      if (username == 'user3') return { id: 3, username: 'user3' };
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: UserService, useValue: mockUserService },
      ],
      controllers: [ChatController],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const payload = { username: 'user3' };

    const { messageKey } = await controller.createChat(sess, payload);
    expect(messageKey).toBe('encryptedMessageKey');
  });

  it('should throw an error when creating a chat with a non-existed user', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const payload = { username: 'user4' };

    expect(controller.createChat(sess, payload)).rejects.toThrow(UserNotExistedException);
  });

  it('should throw an error when creating a self chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const payload = { username: 'user1' };

    expect(controller.createChat(sess, payload)).rejects.toThrow(CreateSelfChatException);
  });

  it('should throw an error when creating a existed chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const payload = { username: 'user2' };

    expect(controller.createChat(sess, payload)).rejects.toThrow(ChatExistedException);
  });
});

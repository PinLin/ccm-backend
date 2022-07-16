import { Test, TestingModule } from '@nestjs/testing';
import { EventGateway } from '../event/event.gateway';
import { UserNotExistedException } from '../user/exception/user-not-existed.exception';
import { UserService } from '../user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageType } from './enum/message.enum';
import { ChatExistedException } from './exception/chat-existed.exception';
import { ChatNotExistedException } from './exception/chat-not-existed.exception';
import { CreateSelfChatException } from './exception/create-self-chat.exception';
import { MessageNotExistedException } from './exception/message-not-existed.exception';

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
    findAllChats: jest.fn((userId) => {
      if (userId == 1 || userId == 2) return [
        {
          id: 1,
          members: [
            { userId: 1, encryptedMessageKey: 'encryptedMessageKey' },
            { userId: 2, encryptedMessageKey: 'encryptedMessageKey' },
          ],
        },
      ];
      return [];
    }),
    sendMessage: jest.fn((_, senderId, payload) => ({ ...payload, senderId, })),
    getManyMessages: jest.fn((chatId) => {
      if (chatId == 1) return [
        {
          senderId: 1,
          type: MessageType.Text,
          content: 'test',
        },
      ];
      return [];
    }),
    getMessage: jest.fn((chatId, messageId) => {
      if (chatId == 1 && messageId == 1) return {
        senderId: 1,
        type: MessageType.Text,
        content: 'test',
      };
      return null;
    })
  };
  const mockUserService = {
    findOneByUsername: jest.fn(username => {
      if (username == 'user1') return { id: 1, username: 'user1' };
      if (username == 'user2') return { id: 2, username: 'user2' };
      if (username == 'user3') return { id: 3, username: 'user3' };
      return null;
    }),
    findOne: jest.fn(id => {
      if (id == 1) return { id: 1, username: 'user1' };
      if (id == 2) return { id: 2, username: 'user2' };
      if (id == 3) return { id: 3, username: 'user3' };
      return null;
    }),
  };
  const mockEventGateway = {
    notifyNewMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: UserService, useValue: mockUserService },
        { provide: EventGateway, useValue: mockEventGateway },
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

  it('should find a chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user2';

    const { messageKey } = await controller.findChat(sess, username);
    expect(messageKey).toBe('encryptedMessageKey');
  });

  it('should throw an error when finding a non-existed chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user3';

    expect(controller.findChat(sess, username)).rejects.toThrow(ChatNotExistedException);
  });

  it('should throw an error when finding a chat with a non-existed user', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user4';

    expect(controller.findChat(sess, username)).rejects.toThrow(UserNotExistedException);
  });

  it('should find all one chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };

    const { rooms } = await controller.findAllChats(sess);
    expect(rooms).toHaveLength(1);
  });

  it('should find all zero chats', async () => {
    const sess = { salt: 'salt', username: 'user3', loggedIn: true };

    const { rooms } = await controller.findAllChats(sess);
    expect(rooms).toHaveLength(0);
  });

  it('should send a message', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const receiverUsername = 'user2';
    const payload = { type: MessageType.Text, content: 'test' };

    const result = await controller.sendMessage(sess, receiverUsername, payload);
    expect(result.sender).toBe('user1');
    expect(result.type).toBe(payload.type);
    expect(result.content).toBe(payload.content);
  });

  it('should throw an error when sending messages to non-existed chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const receiverUsername = 'user3';
    const payload = { type: MessageType.Text, content: 'test' };

    expect(controller.sendMessage(sess, receiverUsername, payload)).rejects.toThrow(ChatNotExistedException);
  });

  it('should get messages in the specific chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user2';
    const filter = {};

    const { messages } = await controller.getManyMessages(sess, username, filter);
    expect(messages).toHaveLength(1);
  });

  it('should throw an error when getting messages in a non-existed chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user3';
    const filter = {};

    expect(controller.getManyMessages(sess, username, filter)).rejects.toThrow(ChatNotExistedException);
  });

  it('should get the message in the specific chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user2';
    const messageId = 1;

    const message = await controller.getMessage(sess, username, messageId);
    expect(message.sender).toBe('user1');
    expect(message.type).toBe(MessageType.Text);
    expect(message.content).toBe('test');
  });

  it('should throw an error when getting messages in a non-existed chat', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user3';
    const messageId = 1;

    expect(controller.getMessage(sess, username, messageId)).rejects.toThrow(ChatNotExistedException);
  });

  it('should throw an error when getting a non-existed message', async () => {
    const sess = { salt: 'salt', username: 'user1', loggedIn: true };
    const username = 'user2';
    const messageId = 2;

    expect(controller.getMessage(sess, username, messageId)).rejects.toThrow(MessageNotExistedException);
  });
});

import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { Server } from 'socket.io';
import * as Express from 'express';
import * as socketioSession from 'express-socket.io-session'

export class EventAdapter extends IoAdapter {
    constructor(
        private readonly app: INestApplication,
        private readonly expressSession: Express.RequestHandler,
    ) {
        super(app);
    }

    createIOServer(port: number, options?: any) {
        const server: Server = super.createIOServer(port, options);
        server.use(socketioSession(this.expressSession, {
            autoSave: true,
            saveUninitialized: false,
        }));
        return server;
    }
}

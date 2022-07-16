import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    EventModule,
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }

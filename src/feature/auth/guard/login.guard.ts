import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ReqSession } from '../types/request-session';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const sess = req.session as ReqSession;
    return sess?.loggedIn;
  }
}

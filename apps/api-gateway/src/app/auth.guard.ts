import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
@Injectable() export class AuthGuard implements CanActivate {
  constructor(private readonly auth:AuthService){}
  canActivate(ctx:ExecutionContext){ const req=ctx.switchToHttp().getRequest(); const raw=String(req.headers.authorization||''); if(!raw.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required'); const user=this.auth.verify(raw.slice(7)); req.user=user; return true; }
}

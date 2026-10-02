import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { DbService } from '@ali-labs/backend-core';
import { createHmac, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCb);

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}
  async register(emailRaw:string,password:string,displayName:string){
    const email=emailRaw.trim().toLowerCase(); if(!email || password.length<8) throw new UnauthorizedException('Valid email and 8+ character password required');
    const existing=await this.db.query('select id from app_users where email=$1',[email]); if(existing.length) throw new ConflictException('Email already registered');
    const salt=randomBytes(16).toString('hex'); const hash=(await scrypt(password,salt,64) as Buffer).toString('hex'); const id=randomUUID();
    await this.db.query('insert into app_users(id,email,display_name,password_salt,password_hash) values($1,$2,$3,$4,$5)',[id,email,displayName||email.split('@')[0],salt,hash]);
    return this.issue({id,email,displayName:displayName||email.split('@')[0]});
  }
  async login(emailRaw:string,password:string){
    const email=emailRaw.trim().toLowerCase(); const rows=await this.db.query<any>('select id,email,display_name,password_salt,password_hash from app_users where email=$1',[email]); const u=rows[0]; if(!u) throw new UnauthorizedException('Invalid credentials');
    const hash=await scrypt(password,u.password_salt,64) as Buffer; const stored=Buffer.from(u.password_hash,'hex'); if(stored.length!==hash.length || !timingSafeEqual(stored,hash)) throw new UnauthorizedException('Invalid credentials');
    return this.issue({id:u.id,email:u.email,displayName:u.display_name});
  }
  verify(token:string){
    const [h,p,s]=token.split('.'); if(!h||!p||!s) throw new UnauthorizedException(); const expected=this.sign(`${h}.${p}`); if(expected.length!==s.length || !timingSafeEqual(Buffer.from(expected),Buffer.from(s))) throw new UnauthorizedException();
    const payload=JSON.parse(Buffer.from(p,'base64url').toString('utf8')); if(!payload.exp || payload.exp*1000<Date.now()) throw new UnauthorizedException('Token expired'); return payload;
  }
  private issue(user:{id:string,email:string,displayName:string}){ const now=Math.floor(Date.now()/1000); const payload={sub:user.id,email:user.email,name:user.displayName,iat:now,exp:now+60*60*24*30}; const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'); const p=Buffer.from(JSON.stringify(payload)).toString('base64url'); const token=`${h}.${p}.${this.sign(`${h}.${p}`)}`; return {token,user}; }
  private sign(value:string){ return createHmac('sha256',process.env.JWT_SECRET||'change-me-in-production').update(value).digest('base64url'); }
}

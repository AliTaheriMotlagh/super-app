import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'node:path';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { MICRO_APP_BY_SLUG, MICRO_APPS } from '@ali-labs/contracts';
import { DbService } from '@ali-labs/backend-core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

const UPLOAD_DIR=resolve(process.env.UPLOAD_DIR||'./uploads'); mkdirSync(UPLOAD_DIR,{recursive:true});
const storage=diskStorage({destination:UPLOAD_DIR,filename:(_req,file,cb)=>cb(null,`${randomUUID()}${extname(file.originalname).slice(0,12)}`)});

@Controller('api')
export class AppController {
  private clients:Record<string,ClientProxy>;
  constructor(
    @Inject('UTILITY_SERVICE') utility:ClientProxy,@Inject('COMMERCE_SERVICE') commerce:ClientProxy,@Inject('PRODUCTIVITY_SERVICE') productivity:ClientProxy,
    @Inject('GEO_SERVICE') geo:ClientProxy,@Inject('SOCIAL_SERVICE') social:ClientProxy,@Inject('MEDIA_SERVICE') media:ClientProxy,@Inject('FINANCE_SERVICE') finance:ClientProxy,
    @Inject('CONTENT_SERVICE') content:ClientProxy,@Inject('NOTIFICATION_SERVICE') notification:ClientProxy,@Inject('GAME_SERVICE') game:ClientProxy,@Inject('IMPACT_SERVICE') impact:ClientProxy,
    private readonly auth:AuthService, private readonly db:DbService,
  ) { this.clients={'utility-service':utility,'commerce-service':commerce,'productivity-service':productivity,'geo-service':geo,'social-service':social,'media-service':media,'finance-service':finance,'content-service':content,'notification-service':notification,'game-service':game,'impact-service':impact}; }

  @Post('auth/register') register(@Body() b:any){return this.auth.register(String(b.email||''),String(b.password||''),String(b.displayName||''));}
  @Post('auth/login') login(@Body() b:any){return this.auth.login(String(b.email||''),String(b.password||''));}
  @Get('health') async health(){return await Promise.all(Object.entries(this.clients).map(([service,client])=>firstValueFrom(client.send('health',{})).catch(()=>({service,ok:false}))));}
  @Get('catalog') catalog(){return {count:MICRO_APPS.length,apps:MICRO_APPS,architecture:'Angular Native Federation + NestJS TCP microservices + PostgreSQL'};}

  @Get('public/:slug/records') listPublic(@Param('slug') slug:string){ return this.send(slug,'record.list',{appSlug:slug,userId:'public',publicOnly:true}); }
  @UseGuards(AuthGuard) @Get('apps/:slug/records') list(@Param('slug') slug:string,@Req() req:any){return this.send(slug,'record.list',{appSlug:slug,userId:req.user.sub});}
  @UseGuards(AuthGuard) @Post('apps/:slug/records') create(@Param('slug') slug:string,@Req() req:any,@Body() body:any){return this.send(slug,'record.create',{appSlug:slug,userId:req.user.sub,data:body.data||body,isPublic:!!body.isPublic});}
  @UseGuards(AuthGuard) @Patch('apps/:slug/records/:id') update(@Param('slug') slug:string,@Param('id') id:string,@Req() req:any,@Body() body:any){return this.send(slug,'record.update',{appSlug:slug,userId:req.user.sub,id,data:body.data||body,isPublic:body.isPublic});}
  @UseGuards(AuthGuard) @Delete('apps/:slug/records/:id') remove(@Param('slug') slug:string,@Param('id') id:string,@Req() req:any){return this.send(slug,'record.delete',{appSlug:slug,userId:req.user.sub,id});}
  @UseGuards(AuthGuard) @Post('apps/:slug/actions/:action') action(@Param('slug') slug:string,@Param('action') action:string,@Req() req:any,@Body() input:any){return this.send(slug,'app.action',{appSlug:slug,action,userId:req.user.sub,input});}

  @UseGuards(AuthGuard) @Post('apps/timed-file/upload') @UseInterceptors(FileInterceptor('file',{storage,limits:{fileSize:Number(process.env.MAX_UPLOAD_BYTES||25_000_000)}}))
  async uploadTimed(@Req() req:any,@UploadedFile() file:Express.Multer.File,@Body() body:any){ if(!file) throw new BadRequestException('file required'); const id=randomUUID(); const unlockAt=body.unlockAt?new Date(body.unlockAt):null; await this.db.query('insert into file_objects(id,user_id,app_slug,original_name,stored_name,mime_type,size_bytes,unlock_at) values($1,$2,$3,$4,$5,$6,$7,$8)',[id,req.user.sub,'timed-file',file.originalname,file.filename,file.mimetype,file.size,unlockAt]); return {id,name:file.originalname,size:file.size,unlockAt}; }

  @Get('public/timed-file/:id') async timedFileInfo(@Param('id') id:string){ const rows=await this.db.query<any>('select id,original_name,mime_type,size_bytes,unlock_at,created_at from file_objects where id=$1',[id]); const f=rows[0]; if(!f) throw new BadRequestException('File not found'); const unlocked=!f.unlock_at || new Date(f.unlock_at).getTime()<=Date.now(); return {id:f.id,name:f.original_name,mimeType:f.mime_type,size:Number(f.size_bytes),unlockAt:f.unlock_at,createdAt:f.created_at,unlocked,downloadUrl:unlocked?`/api/public/timed-file/${id}/download`:null}; }

  @Get('public/timed-file/:id/download') async timedFileDownload(@Param('id') id:string,@Res({passthrough:true}) res:any){ const rows=await this.db.query<any>('select original_name,stored_name,mime_type,unlock_at from file_objects where id=$1',[id]); const f=rows[0]; if(!f) throw new BadRequestException('File not found'); if(f.unlock_at && new Date(f.unlock_at).getTime()>Date.now()) throw new BadRequestException('File is still locked'); const path=resolve(UPLOAD_DIR,f.stored_name); if(!existsSync(path)) throw new BadRequestException('Stored file is missing'); res.setHeader('Content-Type',f.mime_type||'application/octet-stream'); res.setHeader('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(f.original_name)}`); return new StreamableFile(createReadStream(path)); }

  private send(slug:string,pattern:string,payload:any){ const app=MICRO_APP_BY_SLUG.get(slug); if(!app) throw new BadRequestException('Unknown micro-app'); const client=this.clients[app.service]; if(!client) throw new BadRequestException('Service not configured'); return firstValueFrom(client.send(pattern,payload)); }
}

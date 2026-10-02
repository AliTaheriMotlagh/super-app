import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DomainService } from '@ali-labs/backend-core';

@Controller()
export class AppController {
  constructor(private readonly domain: DomainService) {}
  @MessagePattern('health') health(){ return this.domain.health(); }
  @MessagePattern('projects') projects(){ return this.domain.projects(); }
  @MessagePattern('record.list') list(payload:any){ return this.domain.list(payload); }
  @MessagePattern('record.create') create(payload:any){ return this.domain.create(payload); }
  @MessagePattern('record.update') update(payload:any){ return this.domain.update(payload); }
  @MessagePattern('record.delete') remove(payload:any){ return this.domain.remove(payload); }
  @MessagePattern('app.action') action(payload:any){ return this.domain.action(payload); }
}

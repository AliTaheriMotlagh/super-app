import { Module } from '@nestjs/common';
import { BackendCoreModule } from '@ali-labs/backend-core';
import { AppController } from './app.controller';
@Module({ imports:[BackendCoreModule.forService('media-service')], controllers:[AppController] })
export class AppModule {}

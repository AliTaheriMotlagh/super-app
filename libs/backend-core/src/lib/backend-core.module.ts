import { DynamicModule, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { DomainService } from './domain.service';

@Module({})
export class BackendCoreModule {
  static forService(serviceName: string): DynamicModule {
    return {
      module: BackendCoreModule,
      providers: [DbService, DomainService, { provide: 'DOMAIN_SERVICE_NAME', useValue: serviceName }],
      exports: [DbService, DomainService],
    };
  }
}

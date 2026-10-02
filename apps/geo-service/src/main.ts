import { NestFactory } from '@nestjs/core'; import { MicroserviceOptions, Transport } from '@nestjs/microservices'; import { AppModule } from './app/app.module';
async function bootstrap(){const app=await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{transport:Transport.TCP,options:{host:'0.0.0.0',port:5004}});await app.listen();console.log('geo-service TCP :5004');} bootstrap();

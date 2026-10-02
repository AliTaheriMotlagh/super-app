import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
async function bootstrap(){
  const app=await NestFactory.create(AppModule,{bufferLogs:true});
  app.enableCors({origin:(process.env.CORS_ORIGINS||'http://localhost:4200').split(','),credentials:false,allowedHeaders:['Content-Type','Authorization']});
  app.setGlobalPrefix('');
  await app.listen(Number(process.env.PORT||5000),'0.0.0.0');
  console.log(`api-gateway HTTP :${process.env.PORT||5000}`);
} bootstrap();

/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path'
import * as bodyParser from 'body-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';



async function bootstrap() {
  const corsConfig: CorsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true,
  };




  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: corsConfig });

  app.setGlobalPrefix('api', { exclude: ['/'] }); // Prefix all routes with /api except the root

  app.use(bodyParser.json({ limit: '5mb' })); // Ajuste o limite conforme necessário
  // app.use(bodyParser.urlencoded({ limit: '5mb', extended: true })); // Ajuste o limite conforme necessário


  app.useStaticAssets(path.join(__dirname, 'public'));
  app.setBaseViewsDir(path.join(__dirname, 'public'));
  app.setViewEngine('hbs');


  // app.enableCors(corsConfig);
  await app.listen(3000);


}
bootstrap();

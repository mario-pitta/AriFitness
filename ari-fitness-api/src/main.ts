/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path'
import * as bodyParser from 'body-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';
dotenv.config();



async function bootstrap() {
  const corsConfig: CorsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true,
  };

  console.log('PROD_ENV = ', Boolean(process.env.PROD_ENV))

  console.log('process.env.PROD_ENV = ', process.env.PROD_ENV)


  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: corsConfig });

  app.use(bodyParser.json({ limit: '5mb' })); // Ajuste o limite conforme necessário
  // app.use(bodyParser.urlencoded({ limit: '5mb', extended: true })); // Ajuste o limite conforme necessário


  app.useStaticAssets(path.join(__dirname, 'public'));
  app.setBaseViewsDir(path.join(__dirname, 'public'));
  app.setViewEngine('hbs');


  // app.enableCors(corsConfig);
  await app.listen(3000);


}
bootstrap();

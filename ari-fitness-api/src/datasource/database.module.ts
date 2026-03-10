/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { DataBaseController } from './database.controller';
import { DataBaseService } from './database.service';
import { StorageService } from './storage.service';

@Module({
  imports: [],
  controllers: [DataBaseController],
  providers: [DataBaseService, StorageService],
  exports: [DataBaseService, StorageService]
})
export class DataBaseModule { }


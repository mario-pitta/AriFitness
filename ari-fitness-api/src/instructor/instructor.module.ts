import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { DataBaseModule } from '../datasource/database.module';

@Module({
  imports: [DataBaseModule],
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService],

})
export class InstructorModule { }

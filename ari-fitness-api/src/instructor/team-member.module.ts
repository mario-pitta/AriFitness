import { Module } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { DataBaseModule } from '../datasource/database.module';

@Module({
    imports: [DataBaseModule],
    controllers: [TeamMemberController],
    providers: [TeamMemberService],
    exports: [TeamMemberService]
})
export class TeamMemberModule { }

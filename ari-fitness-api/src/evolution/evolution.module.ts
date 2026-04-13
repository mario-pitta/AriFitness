import { Module } from "@nestjs/common";
import { EvolutionService } from "./evolution.service";
import { EvolutionController } from "./evolution.controller";
import { DataBaseModule } from "../datasource/database.module";

@Module({
    imports: [DataBaseModule],
    controllers: [EvolutionController],
    providers: [EvolutionService],
    exports: [EvolutionService]
})
export class EvolutionModule { }

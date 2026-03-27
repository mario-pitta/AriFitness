import { Module } from "@nestjs/common";
import { AutomationsController } from "./automations.controller";
import { AutomationsService } from "./automations.service";
import { UsuarioModule } from "src/usuario/usuario.module";
import { EmpresaModule } from "src/empresa/empresa.module";
import { DataBaseModule } from "src/datasource/database.module";

@Module({
    imports: [
        UsuarioModule,
        EmpresaModule,
        DataBaseModule,
    ],
    controllers: [AutomationsController],
    providers: [AutomationsService],
})
export class AutomationsModule { }
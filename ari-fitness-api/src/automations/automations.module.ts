import { Module } from "@nestjs/common";
import { AutomationsController } from "./automations.controller";
import { AutomationsService } from "./automations.service";
import { UsuarioModule } from "../usuario/usuario.module";
import { EmpresaModule } from "../empresa/empresa.module";
import { DataBaseModule } from "../datasource/database.module";

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
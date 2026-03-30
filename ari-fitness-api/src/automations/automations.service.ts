import { Injectable } from "@nestjs/common";
import { EmpresaService } from "../empresa/empresa.service";
import { UsuarioService } from "../usuario/usuario.service";

@Injectable()
export class AutomationsService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly empresaService: EmpresaService,


    ) { }


    async getCompanies() {
        const { data, error } = await this.empresaService.findAll();
        if (error) {
            throw error;
        }
        return data;
    }



    async getAlunosByEmpresaId(empresaId: string) {
        const { data, error } = await this.usuarioService.findByFilters({
            empresa_id: empresaId,
            tipo_usuario: 5,
            fl_ativo: true
        })
        if (error) {
            throw error;
        }


        if (data.length) {
            data.map(async (item) => {

                const ultimoCheckin = await this.usuarioService.getFrequencyByCPFandEmpresaId(item.cpf, empresaId)


                console.log('ultimoCheckin = ', ultimoCheckin)

                item = {
                    ...item,
                    status_pagamento: this.usuarioService.checkStatusPagamento(item.id, item.transacao_financeira),
                    ultimo_checkin: ultimoCheckin.data || null,

                }

                delete item.senha;
                delete item.cpf;

                delete item.transacao_financeira;
                delete item.horario;
                delete item.plano;
                delete item.horario_id;
                delete item.plano_id;
                delete item.empresa_id;
                delete item.tipo_usuario;
                delete item.fl_ativo;
                delete item.foto_url;
                delete item.avc;
                delete item.dac;
                delete item.diabete;
                delete item.pressao_arterial;
                delete item.cardiopata;
                delete item.infarto;
                delete item.genero;
                delete item.fumante;
                delete item.objetivo;

                delete item.email;
                delete item.data_ultimo_pagamento;


                return item;

            })
        }


        return data;
    }


}
/* eslint-disable prettier/prettier  */
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { TransacaoFinanceiraDashService } from './transacao-financeira-dash.service';
import { Response } from 'express';

@Controller('transacao-financeira-dash')
export class TransacaoFinanceiraDashController {

    constructor(private transFinanServ: TransacaoFinanceiraDashService) { }

    @Get()
    findAll(@Query() query: { data_inicio: string, data_fim: string, empresa_id: string, orderBy: string, asc: boolean }, @Res() res: Response) {
        console.log('findAll query: ', query);
        if (!query.data_fim) query.data_fim = new Date().toISOString();
        //1 mes atras
        if (!query.data_inicio) query.data_inicio = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();

        return this.transFinanServ.buildDashboardData(query).then(_res => {
            res.send(_res);
        });
    }


    @Get('receitas-por-mes/:empresaId')
    async obterReceitaMensal(@Param('empresaId') empresaId: string) {
        console.log('chegou')
        return await this.transFinanServ.obterAnaliseReceitasMensal(new Date().getFullYear(), empresaId)
    }

    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response) {
        try {
            const data = await this.transFinanServ.getExportData(query);
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send({ error: 'Erro ao gerar dados para exportação' });
        }
    }
}

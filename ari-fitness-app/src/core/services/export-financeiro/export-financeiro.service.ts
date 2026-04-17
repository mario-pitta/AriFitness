import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
// @ts-ignore
import * as FileSaver from 'file-saver';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransacaoFinanceira } from 'src/core/models/TransacaoFInanceira';

import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as pdfFontsModule from 'pdfmake/build/vfs_fonts';

const pdfMake: any = (pdfMakeModule as any).default || pdfMakeModule;
const pdfFonts: any = (pdfFontsModule as any).default || pdfFontsModule;
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake['vfs'] : pdfFonts['vfs'];
@Injectable({
    providedIn: 'root'
})
export class ExportFinanceiroService {

    constructor() { }

    /**
     * Generates a PDF report for financial transactions.
     */
    async generatePDF(data: {
        transacoes: TransacaoFinanceira[];
        empresaNome: string;
        periodo: { inicio: string; fim: string };

    }) {
        try {
            console.log('data = ', data);

            const { transacoes, empresaNome, periodo } = data;

            pdfMake.fonts = undefined; // Force PDFMake to use its default which maps exactly to the bundled vfs_fonts


            console.log('transacoes = ', transacoes)

            const totalReceitas = transacoes
                .filter((t: any) => t.tr_tipo_id === 1 && t.fl_pago && t.fl_ativo)
                .reduce((acc: number, t: any) => acc + (t.valor_final || 0), 0);

            const totalDespesas = transacoes
                .filter((t: any) => t.tr_tipo_id === 2 && t.fl_pago && t.fl_ativo)
                .reduce((acc: number, t: any) => acc + (t.valor_final || 0), 0);

            const saldoFinal = totalReceitas - totalDespesas;

            const tableBody = [
                [
                    { text: 'Data', style: 'tableHeader' },
                    { text: 'Descrição', style: 'tableHeader' },
                    { text: 'Categoria', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' },
                    { text: 'Valor', style: 'tableHeader' }
                ]
            ];

            transacoes.forEach((t: any) => {
                const status = t.fl_ativo ? (t.fl_pago ? 'Pago' : 'Pendente') : 'Cancelado';
                const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor_final);

                tableBody.push([
                    format(new Date(t.data_lancamento), 'dd/MM/yyyy'),
                    t.descricao || '',
                    t.categoria?.descricao || '',
                    status,
                    { text: valorFormatado, color: t.tr_tipo_id === 1 ? '#2dd36f' : '#eb445a', alignment: 'right' }
                ] as any);
            });

            const docDefinition: any = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                header: (currentPage: number) => {
                    return {
                        margin: [40, 20, 40, 0],
                        columns: [
                            { text: empresaNome.toUpperCase(), style: 'headerLeft' },
                            { text: `Pág. ${currentPage}`, alignment: 'right', fontSize: 8, color: '#666' }
                        ]
                    };
                },
                content: [
                    { text: 'Relatório Financeiro', style: 'mainTitle' },
                    {
                        text: `Período: ${format(new Date(periodo.inicio), 'dd/MM/yyyy')} até ${format(new Date(periodo.fim), 'dd/MM/yyyy')}`,
                        style: 'subTitle'
                    },
                    { text: `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, style: 'dateInfo' },

                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', 'auto', 'auto', 'auto'],
                            body: tableBody
                        },
                        layout: 'lightHorizontalLines'
                    },

                    {
                        margin: [0, 20, 0, 0],
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                ['Total de Receitas:', { text: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceitas), color: '#2dd36f', bold: true }],
                                ['Total de Despesas:', { text: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas), color: '#eb445a', bold: true }],
                                [{ text: 'Saldo Final:', bold: true }, { text: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal), bold: true, fontSize: 14 }]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ],
                styles: {
                    headerLeft: { fontSize: 10, bold: true, color: '#3171e0' },
                    mainTitle: { fontSize: 18, bold: true, margin: [0, 0, 0, 5], alignment: 'center' },
                    subTitle: { fontSize: 12, margin: [0, 0, 0, 2], alignment: 'center' },
                    dateInfo: { fontSize: 10, color: '#666', margin: [0, 0, 0, 20], alignment: 'center' },
                    tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#f4f5f8' },
                    tableExample: { margin: [0, 5, 0, 15], fontSize: 10 }
                }
            };

            pdfMake.createPdf(docDefinition).download(`Financeiro_${empresaNome}_${format(new Date(), 'yyyyMMdd')}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar relatório Financeiro em PDF:', error);
            throw new Error(`Falha na exportação de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async generateExcel(data: any) {
        try {
            const { transacoes, empresaNome, periodo } = data;

            // Formatação de Datas
            const periodoInicio = periodo?.inicio ? format(new Date(periodo.inicio), 'dd/MM/yyyy') : 'Início';
            const periodoFim = periodo?.fim ? format(new Date(periodo.fim), 'dd/MM/yyyy') : 'Atualmente';

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'MvK Gym Manager';
            workbook.created = new Date();

            const initSheet = (sheetName: string, tabColor: string, titleType: string) => {
                const sheet = workbook.addWorksheet(sheetName, { properties: { tabColor: { argb: tabColor } } });

                // Cabeçalhos Iniciais
                sheet.addRow([`MvK Gym Manager - ${empresaNome.toUpperCase()}`]).font = { bold: true, size: 14 };
                sheet.addRow([`Relatório Financeiro: ${periodoInicio} a ${periodoFim} - ${titleType}`]).font = { italic: true, size: 11, color: { argb: 'FF555555' } };
                sheet.addRow([]); // Blank Row

                // Header Table
                const headerRow = sheet.addRow(['Data', 'Descrição', 'Categoria', 'Tipo', 'Status', 'Membro', 'Valor']);
                headerRow.font = { bold: true };
                headerRow.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
                    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
                });

                sheet.getColumn('A').width = 12;
                sheet.getColumn('B').width = 30;
                sheet.getColumn('C').width = 20;
                sheet.getColumn('D').width = 15;
                sheet.getColumn('E').width = 15;
                sheet.getColumn('F').width = 25;
                sheet.getColumn('G').width = 15;

                return sheet;
            };

            const fillSheetData = (sheet: ExcelJS.Worksheet, txs: any[]) => {
                let total = 0;
                txs.forEach((t: any) => {
                    const isReceita = t.tr_tipo_id === 1;
                    const isPago = t.fl_pago && t.fl_ativo;
                    const valor = t.valor_final || 0;

                    if (isPago) {
                        if (isReceita) total += valor;
                        else total -= valor;
                    }

                    const row = sheet.addRow([
                        format(new Date(t.data_lancamento), 'dd/MM/yyyy'),
                        t.descricao || '',
                        t.categoria?.descricao || '',
                        isReceita ? 'Receita' : 'Despesa',
                        t.fl_ativo ? (t.fl_pago ? 'Pago' : 'Pendente') : 'Cancelado',
                        t.membro?.nome || '',
                        valor
                    ]);

                    row.getCell(7).numFmt = '"R$" #,##0.00';
                    row.getCell(7).font = { color: { argb: isReceita ? 'FF00B050' : 'FFFF0000' } };
                });

                sheet.addRow([]);
                const totalRow = sheet.addRow(['', '', '', '', '', 'TOTAL:', total]);
                totalRow.font = { bold: true, size: 12 };
                totalRow.getCell(7).numFmt = '"R$" #,##0.00';
            };

            // Aba Geral
            const sheetGeral = initSheet('GERAL', 'FF000000', 'Todas as Transações');
            fillSheetData(sheetGeral, transacoes);

            // Aba Receitas
            const txsReceitas = transacoes.filter((t: any) => t.tr_tipo_id === 1);
            if (txsReceitas.length > 0) {
                const sheetReceitas = initSheet('Receitas', 'FF28A745', 'Receitas Consolidadas');
                fillSheetData(sheetReceitas, txsReceitas);
            }

            // Aba Despesas
            const txsDespesas = transacoes.filter((t: any) => t.tr_tipo_id === 2);
            if (txsDespesas.length > 0) {
                const sheetDespesas = initSheet('Despesas', 'FFDC3545', 'Despesas Consolidadas');
                fillSheetData(sheetDespesas, txsDespesas);
            }

            // Abas de Categorias (Unique)
            const categoriasKeys = [...new Set(transacoes.map((t: any) => t.categoria?.descricao).filter(Boolean))];
            categoriasKeys.forEach(catName => {
                const txsCategorias = transacoes.filter((t: any) => t.categoria?.descricao === catName);
                if (txsCategorias.length > 0) {
                    const isReceitaCat = txsCategorias[0].tr_tipo_id === 1;
                    const catTabColor = isReceitaCat ? 'FF8CE69B' : 'FFFFA4A4'; // Light green / Light red
                    // Limitar tamanho do nome da aba (Excel max: 31 chars)
                    const safeName = String(catName).substring(0, 30).replace(/[/\?\*\[\]]/g, '');
                    const sheetCat = initSheet(safeName, catTabColor, `Categoria: ${catName}`);
                    fillSheetData(sheetCat, txsCategorias);
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            FileSaver.saveAs(blob, `Financeiro_${empresaNome}_${format(new Date(), 'yyyyMMdd')}.xlsx`);

        } catch (error) {
            console.error('Erro ao gerar planilha XLSX usando ExcelJS:', error);
            throw new Error(`Falha na exportação de Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}

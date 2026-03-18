import { Injectable } from '@angular/core';
import { IEmpresa } from 'src/core/models/Empresa';
import { IUsuario } from 'src/core/models/Usuario';
import pkg from '../../../../package.json';

@Injectable({
    providedIn: 'root'
})
export class WorkoutExportService {

    constructor() { }

    /**
   * Exporta o treino ou ficha para PDF com layout profissional, grid de seções e branding dinâmico
   */
    async exportToPDF(data: any, aluno: Partial<IUsuario>, empresa: IEmpresa | null, instrutor?: Partial<IUsuario>) {
        console.log('data = ', data)
        console.log('aluno = ', aluno)
        console.log('empresa = ', empresa)
        console.log('instrutor = ', instrutor)

        const studentName = aluno?.nome || 'Não informado';


        const gymName = empresa?.nome_fantasia || empresa?.nome || 'MvK Gym Manager';
        const instructorName = instrutor?.nome || 'Não informado';
        const gymLogo = empresa?.logo_url || null;
        let gymLogoImage
        if (gymLogo) {
            const reader = new FileReader();
            reader.onload = async () => {
                gymLogoImage = reader.result as string;
            };
            await reader.readAsDataURL(new Blob([await fetch(gymLogo).then(res => res.arrayBuffer())], { type: 'image/jpeg' }));

        }
        const systemBranding = `${(pkg as any).name} v${(pkg as any).version}`;
        const printDate = new Date().toLocaleString('pt-BR');

        const startDate = data.ficha_data_inicio ? new Date(data.ficha_data_inicio).toLocaleDateString('pt-BR') : '-';
        const endDate = data.ficha_data_fim ? new Date(data.ficha_data_fim).toLocaleDateString('pt-BR') : '-';
        const period = `${startDate} até ${endDate}`;

        const sessoes = data.sessoes || [];

        // Lazy load pdfmake and fonts
        const pdfMakeModule = (await import('pdfmake/build/pdfmake')) as any;
        const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')) as any;
        const pdfMake = pdfMakeModule.default || pdfMakeModule;
        const pdfFonts = pdfFontsModule.default || pdfFontsModule;

        let vfs: any = pdfFonts.vfs || pdfFonts.pdfMake?.vfs || null;
        if (!vfs) {
            vfs = {};
            for (const key in pdfFonts) {
                if (key.endsWith('.ttf')) vfs[key] = pdfFonts[key];
            }
        }

        if (vfs) {
            pdfMake.vfs = vfs;
            const vfsKeys = Object.keys(vfs);
            const foundRoboto = vfsKeys.find(k => k.includes('Roboto-Regular')) || vfsKeys[0];
            const baseFontData = vfs[foundRoboto];
            if (baseFontData) {
                ['Roboto-Regular.ttf', 'Roboto-Medium.ttf', 'Roboto-Italic.ttf', 'Roboto-MediumItalic.ttf', 'Roboto-Bold.ttf'].forEach(fontKey => {
                    if (!vfs[fontKey]) vfs[fontKey] = baseFontData;
                });
            }
        }



        const fontsMap = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-MediumItalic.ttf'
            }
        };

        const primaryColor = empresa?.primary_color_hex || '#333333';

        const docDefinition: any = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [30, 30, 30, 40],
            content: [
                // Header
                {
                    columns: [
                        //coluna 1
                        gymLogoImage ? {
                            image: gymLogoImage,
                            width: 60,
                            alignment: 'left'
                        } : { text: gymName, fontSize: 16, bold: true, color: primaryColor },
                        //coluna 2
                        {
                            stack: [
                                { text: '', fontSize: 0, bold: true, width: 40, color: '#666' },
                                { text: gymLogoImage ? gymName : '', fontSize: 25, bold: true, alignment: 'right' }
                            ],
                        },
                        //coluna 3
                        {
                            stack: [
                                { text: 'FICHA DE TREINO', fontSize: 16, bold: true, alignment: 'right' },
                                {
                                    columns: [

                                        {
                                            stack: [
                                                { text: 'Aluno:', fontSize: 10, bold: true, width: 40, color: '#666' },
                                                { text: studentName, fontSize: 10 }
                                            ],
                                        }
                                    ],
                                    alignment: 'right',
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },
                // Secondary Header Info
                {
                    columns: [
                        {
                            stack: [
                                { text: 'Período da Ficha:', fontSize: 9, color: '#666' },
                                { text: period, fontSize: 10, bold: true }
                            ]
                        },
                        {
                            stack: [
                                { text: 'Instrutor:', fontSize: 9, color: '#666' },
                                { text: instructorName, fontSize: 10, bold: true }
                            ],
                            alignment: 'right'
                        }
                    ],
                    margin: [0, 0, 0, 15]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: '#dddddd' }], margin: [0, 0, 0, 15] },

                //Objetivo e Observações
                {
                    columns: [
                        {
                            stack: [
                                { text: 'Objetivo:', fontSize: 8, bold: true, color: '#666' },
                                { text: data.objetivo, fontSize: 8 }
                            ]
                        },
                        {
                            stack: [
                                { text: 'Observações:', fontSize: 8, bold: true, color: '#666', margin: [0, 5, 0, 5] },
                                { text: data.descricao, fontSize: 8 }
                            ]
                        },
                    ],
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: '#dddddd' }], margin: [0, 10, 0, 15] }
            ],
            styles: {
                sessionTitle: { fontSize: 11, bold: true, color: '#0f0f0fff', fillColor: primaryColor, margin: [0, 2, 0, 2] },
                tableHeader: { bold: true, fontSize: 8, color: '#444', fillColor: '#f0f0f0' },
                cellText: { fontSize: 8, margin: [0, 2, 0, 2] }
            },
            defaultStyle: { font: 'Roboto' }
        };

        // Create Session Grids (2 per row)
        const sortedSessions = [...sessoes].sort((a: any, b: any) => a.ordem - b.ordem);
        console.log('sortedSessions = ', sortedSessions)

        const sessionChunks = [];
        for (let i = 0; i < sortedSessions.length; i++) {
            if (i % 2 === 0) {
                if (i === sortedSessions.length - 1) {
                    sessionChunks.push(sortedSessions.slice(i, i + 1));
                } else {
                    sessionChunks.push(sortedSessions.slice(i, i + 2));
                }
            }
        }
        console.log('sessionChunks = ', sessionChunks)

        sessionChunks.forEach(chunk => {

            const columns: any[] = [];
            chunk.forEach((sessao: any) => {
                //adicionar o sessao.nome no topo da tabela de cada sessao

                const sessaoNome = sessao.nome || '';

                console.log('sessaoNome = ', sessaoNome);


                const tableBody = [
                    [
                        { text: 'Exercício', style: 'tableHeader' },
                        { text: 'Sér', style: 'tableHeader', alignment: 'center' },
                        { text: 'Rep', style: 'tableHeader', alignment: 'center' },
                        { text: 'Kg', style: 'tableHeader', alignment: 'center' }
                    ]
                ];

                sessao.exercicios?.sort((a: any, b: any) => a.ordem - b.ordem).forEach((ex: any) => {
                    const exercicioNome = ex.exercicio?.nome || ex.exercicios?.nome || 'N/A';
                    tableBody.push([
                        { text: exercicioNome, style: 'cellText' } as any,
                        { text: ex.series?.toString() || '-', style: 'cellText', alignment: 'center' } as any,
                        { text: ex.repeticoes?.toString() || '-', style: 'cellText', alignment: 'center' } as any,
                        { text: ex.carga?.toString() || '-', style: 'cellText', alignment: 'center' } as any
                    ]);
                });

                console.log('sessao.nome} = ', sessao)

                columns.push({
                    width: '*',
                    stack: [
                        { text: `Sessão ${sessao.nome}`, alignment: 'left' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 25, 25, 25],
                                body: tableBody
                            },
                            layout: {
                                hLineWidth: () => 0.1,
                                vLineWidth: () => 0.1,
                                hLineColor: () => '#eeeeee',
                                vLineColor: () => '#eeeeee'
                            }
                        }
                    ],
                    margin: [columns.length === 0 ? 0 : 10, 0, columns.length === 0 ? 10 : 0, 15]
                });
            });

            // If only one session in chunk, add empty column for alignment
            if (columns.length === 1) {
                columns.push({ width: '*', text: '' });
            }

            docDefinition.content.push({ columns });
        });

        // Footer
        docDefinition.footer = (currentPage: number, pageCount: number) => {
            return {
                stack: [
                    { canvas: [{ type: 'line', x1: 30, y1: 0, x2: 565, y2: 0, lineWidth: 0.1, lineColor: '#aaaaaa' }] },
                    {
                        columns: [
                            { text: `${systemBranding} | ${printDate}`, alignment: 'left', margin: [30, 5, 0, 0] },
                            { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', margin: [0, 5, 30, 0] }
                        ],
                        fontSize: 7,
                        color: '#999999'
                    }
                ]
            };
        };


        console.log('docDefinition = ', docDefinition)
        pdfMake.createPdf(docDefinition, null, fontsMap, vfs).download(`Ficha_${studentName.replace(/\s+/g, '_') + '_' + new Date().toISOString().replace(/\s+/g, '_') + '_' + (empresa?.nome || empresa?.nome_fantasia || '').replace(/\s+/g, '_') + '_' + pkg.name}.pdf`);
    }

    /**
     * Exporta o treino ou ficha para Excel (formato tabular)
     */
    async exportToExcel(data: any) {
        const nome = data.nome || data.descricao || 'Ficha';
        console.log('data = ', data)
        const aluno = data.aluno;
        console.log('aluno = ', aluno)
        const instrutor = data.instrutor;
        console.log('instrutor = ', instrutor)
        const objetivo = data.objetivo;
        console.log('objetivo = ', objetivo)
        const ficha_data_inicio = data.ficha_data_inicio;
        console.log('ficha_data_iniciodata_inicio = ', ficha_data_inicio)
        const ficha_data_fim = data.ficha_data_fim;
        console.log('ficha_data_fim = ', ficha_data_fim)

        const sessoes = data.sessoes || [];
        const XLSX = await import('xlsx');
        const workbook = XLSX.utils.book_new();

        sessoes.sort((a: any, b: any) => a.ordem - b.ordem).forEach((sessao: any) => {
            const sheetData = sessao.exercicios?.map((ex: any) => {
                const exercicio = ex.exercicio || ex.exercicios;
                return {
                    'Exercício': exercicio?.nome,
                    'Equipamento': exercicio?.equipamento?.nome,
                    'Séries': ex.series,
                    'Repetições': ex.repeticoes,
                    'Carga (kg)': ex.carga,
                    'Intervalo (s)': ex.intervalo,
                    'Tipo': ex.tipo_execucao === 1 ? 'Normal' : ex.tipo_execucao === 2 ? 'Bi-Set' : 'Tri-Set'
                }
            }) || [];

            const worksheet = XLSX.utils.json_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, `Sessão ${sessao.nome} `);
        });
        const docFileName = `Treino_${aluno?.nome.replace(/\s+/g, '_')}_${ficha_data_inicio}_${ficha_data_fim}_${objetivo?.replace(/\s+/g, '_')}.xlsx`;
        XLSX.writeFile(workbook, docFileName);
    }

    /**
     * Dispara a impressão em formato térmico (layout compacto da seção ativa)
     */
    printThermal(sessao: any, aluno: Partial<IUsuario>, empresa: IEmpresa | null, instrutor?: Partial<IUsuario>) {
        if (!sessao) return;

        const studentName = aluno?.nome || 'Não informado';
        const gymName = empresa?.nome_fantasia || empresa?.nome || 'MvK Gym Manager';
        const instructorName = instrutor?.nome || 'Não informado';
        const systemBranding = `${(pkg as any).name} v${(pkg as any).version} `;
        const printDate = new Date().toLocaleString('pt-BR');

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        let html = `
    < html >
    <head>
    <title>Impressão Térmica - ${sessao.nome || 'Treino'} </title>
        <style>
@page { margin: 2mm; }
            body {
    font - family: 'Courier New', Courier, monospace;
    font - size: 11px;
    width: 72mm;
    margin: 0;
    padding: 5px;
    color: #000;
    background: #fff;
}
            .header { text - align: center; margin - bottom: 8px; border - bottom: 1px dashed #000; padding - bottom: 5px; }
            .gym { font - weight: bold; font - size: 13px; text - transform: uppercase; }
            .student { font - size: 12px; font - weight: bold; margin - top: 4px; }
            .info { font - size: 10px; margin - top: 2px; }
            
            .session - block { margin - bottom: 15px; border - bottom: 1px solid #eee; padding - bottom: 10px; }
            .session - title { font - weight: bold; text - align: center; font - size: 14px; margin: 10px 0 5px 0; border: 1px solid #000; padding: 2px; }
            
            table { width: 100 %; border - collapse: collapse; margin - top: 5px; }
            th { text - align: left; border - bottom: 1px solid #000; font - size: 10px; }
            td { padding: 3px 0; vertical - align: top; font - size: 10px; }
            .ex - name { font - weight: bold; }
            
            .footer { margin - top: 15px; text - align: center; font - size: 9px; border - top: 1px dashed #000; padding - top: 5px; color: #333; }
</style>
    </head>
    < body >
    <div class="header" >
        <div class="gym" > ${gymName} </div>
            < div class="student" > ${studentName} </div>
                < div class="info" > Instrutor: ${instructorName} </div>
                    </div>
                        `;

        const sessoesToPrint = sessao.sessoes || [sessao];

        sessoesToPrint.forEach((s: any) => {
            if (!s.exercicios || s.exercicios.length === 0) return;

            html += `
                    < div class="session-block" >
                        <div class="session-title" > SESSÃO ${s.nome} </div>
                            < table >
                            <thead>
                            <tr>
                            <th width="50%" > EXERCÍCIO </th>
                                < th width = "15%" > S </th>
                                    < th width = "15%" > R </th>
                                        < th width = "20%" > KG </th>
                                            </tr>
                                            </thead>
                                                <tbody>
                                                `;

            s.exercicios?.sort((a: any, b: any) => a.ordem - b.ordem).forEach((ex: any) => {
                const exercicioNome = ex.exercicio?.nome || ex.exercicios?.nome || 'N/A';
                html += `
                                            < tr >
                                            <td class="ex-name" > ${exercicioNome} </td>
                                                < td > ${ex.series} </td>
                                                    < td > ${ex.repeticoes} </td>
                                                        < td > ${ex.carga || '-'} </td>
                                                            </tr>
                                                                `;
            });

            html += `
                                                            </tbody>
                                                            </table>
                                                            </div>
                                                                `;
        });

        html += `
                                                            < div class="footer" >
                                                                ${systemBranding} | Instrutor: ${instructorName} <br>
                                                                    ${printDate}
</div>
    <script>
window.onload = function () { window.print(); setTimeout(() => window.close(), 500); }
    </script>
    </body>
    </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    }

    private getDificuldadeText(nivel: number): string {
        const levels: any = {
            1: 'Iniciante',
            2: 'Intermediário',
            3: 'Avançado',
            4: 'Elite',
            5: 'Expert'
        };
        return levels[nivel] || 'Geral';
    }
}

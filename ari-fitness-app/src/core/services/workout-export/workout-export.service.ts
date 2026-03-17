import { Injectable } from '@angular/core';
import { Treino } from 'src/core/models/Treino';
import { IEmpresa } from 'src/core/models/Empresa';
import { IUsuario } from 'src/core/models/Usuario';

@Injectable({
    providedIn: 'root'
})
export class WorkoutExportService {

    constructor() { }

    /**
   * Exporta o treino ou ficha para PDF com layout profissional e branding da empresa
   */
    async exportToPDF(data: any, aluno: Partial<IUsuario>, empresa: IEmpresa | null) {
        console.log('data = ', data)
        console.log('aluno = ', aluno)
        console.log('empresa = ', empresa)

        const nome = aluno.nome || data.descricao || 'Ficha de Treino';
        const descricao = data.descricao || '';
        const sessoes = data.sessoes || [];

        console.log('nome = ', nome)


        // Lazy load pdfmake and fonts to avoid initialization issues
        const pdfMakeModule = (await import('pdfmake/build/pdfmake')) as any;
        const pdfFontsModule = (await import('pdfmake/build/vfs_fonts')) as any;

        // The actual pdfMake object is usually the default export or the module itself
        const pdfMake = pdfMakeModule.default || pdfMakeModule;
        const pdfFonts = pdfFontsModule.default || pdfFontsModule;

        // Extract VFS from the fonts module
        let vfs: any = pdfFonts.vfs || pdfFonts.pdfMake?.vfs || null;

        if (!vfs) {
            // Fallback: collect all .ttf properties directly from the fonts module
            vfs = {};
            for (const key in pdfFonts) {
                if (key.endsWith('.ttf')) {
                    vfs[key] = pdfFonts[key];
                }
            }
            if (Object.keys(vfs).length === 0) vfs = null;
        }

        if (vfs) {
            pdfMake.vfs = vfs;

            // Fix missing fonts by aliasing them in the VFS itself
            const vfsKeys = Object.keys(vfs);
            const foundRoboto = vfsKeys.find(k => k.includes('Roboto-Regular')) || vfsKeys[0];
            const baseFontData = vfs[foundRoboto];

            if (baseFontData) {
                ['Roboto-Regular.ttf', 'Roboto-Medium.ttf', 'Roboto-Italic.ttf', 'Roboto-MediumItalic.ttf', 'Roboto-Bold.ttf'].forEach(fontKey => {
                    if (!vfs[fontKey]) vfs[fontKey] = baseFontData;
                });
            }
        }

        // Standardize fonts mapping
        const fontsMap = {
            Roboto: {
                normal: 'Roboto-Regular.ttf',
                bold: 'Roboto-Medium.ttf',
                italics: 'Roboto-Italic.ttf',
                bolditalics: 'Roboto-MediumItalic.ttf'
            }
        };

        const primaryColor = empresa?.primary_color_hex || '#4d8dff';

        const docDefinition: any = {
            content: [
                // Header with Branding
                {
                    columns: [
                        empresa?.logo_url ? {
                            image: empresa.logo_url,
                            width: 100,
                            alignment: 'left'
                        } : { text: empresa?.nome_fantasia || empresa?.nome || 'MvK Gym Manager', fontSize: 20, bold: true, color: primaryColor },
                        {
                            stack: [
                                { text: 'FICHA DE TREINO', fontSize: 18, bold: true, alignment: 'right', color: primaryColor },
                                { text: nome, fontSize: 14, bold: true, alignment: 'right' },
                            ],
                            margin: [0, 10, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },
                // Aluno / Info Geral
                {
                    canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#eeeeee' }],
                    margin: [0, 0, 0, 10]
                },
                {
                    columns: [
                        {
                            stack: [
                                { text: 'Nível:', fontSize: 10, color: '#888888' },
                                { text: this.getDificuldadeText(data.nivel_dificuldade), fontSize: 12, bold: true }
                            ]
                        },
                        {
                            stack: [
                                { text: 'Foco:', fontSize: 10, color: '#888888' },
                                { text: data.parte_do_corpo?.nome || data.grupo_muscular?.nome || 'Geral', fontSize: 12, bold: true }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },
                {
                    text: descricao,
                    fontSize: 10,
                    italics: true,
                    margin: [0, 0, 0, 20]
                }
            ],
            styles: {
                sessionHeader: {
                    fontSize: 14,
                    bold: true,
                    color: '#ffffff',
                    fillColor: primaryColor,
                    margin: [0, 15, 0, 5],
                    padding: 5
                },
                tableHeader: {
                    bold: true,
                    fontSize: 11,
                    color: '#444444',
                    fillColor: '#f8f9fa'
                },
                cellText: {
                    fontSize: 10,
                    margin: [0, 5, 0, 5]
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        // Add Sessions and Exercises
        sessoes.sort((a: any, b: any) => a.ordem - b.ordem).forEach((sessao: any) => {
            docDefinition.content.push({
                text: `Sessão ${sessao.nome}`,
                style: 'sessionHeader'
            });

            const tableBody = [
                [
                    { text: 'Exercício', style: 'tableHeader' },
                    { text: 'Séries', style: 'tableHeader' },
                    { text: 'Reps', style: 'tableHeader' },
                    { text: 'Carga', style: 'tableHeader' },
                    { text: 'Intervalo', style: 'tableHeader' }
                ]
            ];

            sessao.exercicios?.sort((a: any, b: any) => a.ordem - b.ordem).forEach((ex: any) => {
                const exercicioNome = ex.exercicio?.nome || ex.exercicios?.nome || 'N/A';
                tableBody.push([
                    { text: exercicioNome, style: 'cellText' } as any,
                    { text: ex.series?.toString() || '-', style: 'cellText', alignment: 'center' } as any,
                    { text: ex.repeticoes?.toString() || '-', style: 'cellText', alignment: 'center' } as any,
                    { text: ex.carga ? `${ex.carga}kg` : '-', style: 'cellText', alignment: 'center' } as any,
                    { text: ex.intervalo ? `${ex.intervalo}s` : '-', style: 'cellText', alignment: 'center' } as any
                ]);
            });

            docDefinition.content.push({
                table: {
                    headerRows: 1,
                    widths: ['*', 50, 50, 50, 60],
                    body: tableBody
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 15]
            });
        });

        // Footer
        docDefinition.footer = (currentPage: number, pageCount: number) => {
            return {
                text: `Página ${currentPage} de ${pageCount} | Gerado por MvK Gym Manager`,
                alignment: 'center',
                fontSize: 8,
                color: '#aaaaaa',
                margin: [0, 10, 0, 0]
            };
        };

        pdfMake.createPdf(docDefinition, null, fontsMap, vfs).download(`Treino_${nome.replace(/\s+/g, '_')}.pdf`);
    }

    /**
     * Exporta o treino ou ficha para Excel (formato tabular)
     */
    async exportToExcel(data: any) {
        const nome = data.nome || data.descricao || 'Ficha';
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
            XLSX.utils.book_append_sheet(workbook, worksheet, `Sessão ${sessao.nome}`);
        });

        XLSX.writeFile(workbook, `Treino_${nome.replace(/\s+/g, '_')}.xlsx`);
    }

    /**
     * Dispara a impressão em formato térmico (layout compacto)
     */
    printThermal(data: any, empresa: IEmpresa | null) {
        const nome = data.nome || data.descricao || 'Ficha';
        const sessoes = data.sessoes || [];
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        let html = `
      <html>
        <head>
          <title>Impressão de Treino</title>
          <style>
            @page { margin: 2mm; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px; 
              width: 80mm; 
              margin: 0; 
              padding: 10px;
              color: #000;
            }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .company { font-weight: bold; font-size: 14px; text-transform: uppercase; }
            .workout-name { font-weight: bold; margin: 5px 0; }
            .session { margin-top: 15px; border-top: 1px solid #000; padding-top: 5px; }
            .session-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
            .exercise { margin-bottom: 8px; }
            .ex-name { font-weight: bold; display: block; }
            .ex-details { font-size: 11px; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px dashed #000; padding-top: 5px; }
            .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; margin-right: 5px; vertical-align: middle; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${empresa?.nome || empresa?.nome_fantasia || 'MvK Gym Manager'}</div>
            <div class="workout-name">${nome}</div>
          </div>
    `;

        sessoes.sort((a: any, b: any) => a.ordem - b.ordem).forEach((sessao: any) => {
            html += `
        <div class="session">
          <div class="session-title">SESSÃO ${sessao.nome}</div>
      `;

            sessao.exercicios?.sort((a: any, b: any) => a.ordem - b.ordem).forEach((ex: any) => {
                const exercicioNome = ex.exercicio?.nome || ex.exercicios?.nome || 'N/A';
                html += `
          <div class="exercise">
            <span class="ex-name"><span class="checkbox"></span>${exercicioNome}</span>
            <span class="ex-details">${ex.series}x${ex.repeticoes} | ${ex.carga}kg | ${ex.intervalo}s</span>
          </div>
        `;
            });
            html += `</div>`;
        });

        html += `
          <div class="footer">
            Bom treino!<br>
            ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
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

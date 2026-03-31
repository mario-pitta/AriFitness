import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, take, map, forkJoin, of } from 'rxjs';
import * as XLSX from 'xlsx';
import { ExercicioService } from '../exercicio/exercicio.service';
import { Exercicio } from 'src/core/models/Exercicio';
import * as ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';

/** eslint-disable-next-line @typescript-eslint/no-require-imports */
const saveAs = require('file-saver');

export interface TreinoImportRow {
    templateName: string;
    section: string; // sessao
    order: number;   // ordem
    exerciseName: string; // exercicio
    sets: number;    // series
    reps: string;    // reps
    rest: number;    // descanso_seg
    notes?: string;  // observacoes

    // Internal matching properties
    status?: 'ok' | 'warning' | 'error';
    exerciseId?: number;
    match?: Exercicio;
    suggestions?: Exercicio[];
    validationErrors?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class TreinoImportService {
    constructor(
        private exercicioService: ExercicioService,
        private http: HttpClient
    ) { }

    /**
     * Generates and downloads the Excel template using ExcelJS for advanced features.
     */
    async downloadTemplate() {
        const exercises = await this.exercicioService.find({ limit: 2000 }).toPromise() || [];
        const workbook = new ExcelJS.Workbook();


        const wsInstructions = workbook.addWorksheet('INSTRUÇÕES IMPORTANTES', {
            properties: {
                tabColor: { argb: '0000FF' },
            },
            views: [
                {
                    showGridLines: false,
                }
            ],
        });

        // ── General Worksheet Styles ──────────────────────────────────────────────
        for (let i = 1; i <= 300; i++) {
            const row = wsInstructions.getRow(i);
            const isHeader = i <= 10 && i > 2;
            for (let j = 1; j <= 3; j++) {
                row.getCell(j).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: isHeader ? 'FFDDE5B6' : 'FFFFFFFF' } // Light olive header, white body
                };
            }
        }

        wsInstructions.columns = [
            { header: '', key: 'colA', width: 130 },
            { header: '', key: 'colB', width: 10 },
            { header: '', key: 'colC', width: 130 }
        ];

        wsInstructions.getColumn(1).alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
        wsInstructions.getColumn(3).alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };


        // ── Main Header Title (Merged) ───────────────────────────────────────────
        const mainTitleRow = wsInstructions.getRow(3);
        mainTitleRow.height = 35;
        const mainTitleCell = mainTitleRow.getCell(1);
        mainTitleCell.value = 'INSTRUÇÕES IMPORTANTES (NÃO ALTERE ESTA ABA)';
        wsInstructions.mergeCells('A3:C3');
        mainTitleCell.font = { bold: true, size: 22, color: { argb: 'FFFFFFFF' } };
        mainTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D8A5E' } };
        mainTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // ── Logo Header (Left Side) ───────────────────────────────────────────────
        try {
            const logoBuffer = await this.http.get('assets/mvk-gym-manager-logo.png', { responseType: 'arraybuffer' }).toPromise();
            if (logoBuffer) {
                const logoId = workbook.addImage({
                    buffer: logoBuffer as ArrayBuffer,
                    extension: 'png',
                });
                wsInstructions.addImage(logoId, {
                    tl: { col: 0.1, row: 1 }, // Column A, Row 2-9 area
                    ext: { width: 200, height: 200 }
                });
            }
        } catch (e) {
            console.warn('Logo could not be loaded into Excel', e);
        }

        // ── Introductory Centered Text ──────────────────────────────────────────
        const introTexts = [
            'Essa planilha foi criada para auxiliar na importação de treinos para o sistema.',
            'Ela foi dividida em abas para facilitar a organização.',
            'Cada aba contém dados importantes para o funcionamento correto da importação pelo sistema MvK Gym Manager.',
            '⚠ ATENÇÃO: NÃO remova ou altere os nomes das abas "EXERCISES_DATABASE" e "TREINO".',
            '',
            'Siga os tópicos abaixo para estruturar sua planilha corretamente:',
        ];

        introTexts.forEach((text, i) => {
            const rowNumber = 4 + i;
            const row = wsInstructions.getRow(rowNumber);
            row.height = 20;
            const cell = row.getCell(1);
            wsInstructions.mergeCells(`A${rowNumber}:C${rowNumber}`);
            cell.value = text;
            cell.font = { size: 10, color: { argb: 'FF333333' }, italic: text.includes('ATENÇÃO') };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            // Ensure background is preserved after merge
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDE5B6' } };
        });

        const instructions = [
            {
                col: 1,
                title: {
                    text: '1. Conhecendo a Estrutura da Planilha',
                    font: {
                        bold: true,
                        size: 14,
                        color: { argb: 'FFFFFFFF' },
                        background: { argb: 'FF475569' } // Secondary Slate
                    }
                },
                content: [
                    'A primeira aba é esta que você está vendo agora, orientações essenciais.',
                    '',
                    'A segunda aba é a "TREINO":',
                    '• Nela você irá inserir os dados dos treinos que deseja importar.',
                    '• Dividida em colunas obrigatórias: Sessão, Ordem, Exercício, Séries, Repetições, Descanso e Observações.',
                    '',
                    'A terceira aba é a "EXERCISES_DATABASE"',
                    'ela contém todos os exercícios disponíveis no sistema.',
                    'Você pode usar esta aba para consultar os exercícios disponíveis.',
                    'Caso não encontre o exercício desejado, o sistema irá sugerir exercícios similares.',
                    'Caso deseje adicionar um novo exercício, solicite a inclusão no sistema.',
                    ''
                ],
            },
            {
                col: 3,
                title: {
                    text: '2. Instruções de Preenchimento (Aba TREINO)',
                    font: {
                        bold: true,
                        size: 14,
                        color: { argb: 'FFFFFFFF' },
                        background: { argb: 'FF10B981' } // Tertiary Emerald
                    }
                },
                content: [
                    '1. Sessão: Insira a letra ou nome (ex: A, B, C ou Superior). Repita para todos os exercícios da mesma sessão.',
                    '2. Ordem: A sequência numérica dentro da sessão (1, 2, 3...).',
                    '3. Exercício: Selecione na lista suspensa (dropdown) ou copie o nome exato da base de dados.',
                    '4. Séries: Apenas o número (ex: 3 ou 4).',
                    '5. Repetições: Formato livre (ex: 12, 10-12, Até a falha).',
                    '6. Descanso: Tempo em segundos (ex: 60, 90).',
                    '7. Observações: Informações extras como "Cadência 4020" ou "Drop-set na última".'
                ]
            },
            {
                col: 3,
                title: {
                    text: '3. Dicas de Uso da Base de Dados',
                    font: {
                        bold: true,
                        size: 14,
                        color: { argb: 'FFFFFFFF' },
                        background: { argb: 'FFFFAA00' } // Amber/Warning
                    }
                },
                content: [
                    '• Você pode usar filtros (Ctrl+L) na aba EXERCISES_DATABASE para buscar exercícios por nome, grupo muscular, equipamento, etc.',
                    '• Copie e cole os nomes dos exercícios para evitar erros de digitação.',
                    '• O sistema valida automaticamente se o exercício existe durante a importação.',
                    '• Caso não encontre o exercício desejado, o sistema irá sugerir exercícios similares.',
                    '• Caso deseje adicionar um novo exercício, você pode solicitar a inclusão no sistema.',
                ]
            }
        ];



        const colirizeRows = (rows: any[], bgColor: string, col: number) => {
            const lighten = (hex: string, factor: number = 0.9) => {
                const r = parseInt(hex.substring(2, 4), 16);
                const g = parseInt(hex.substring(4, 6), 16);
                const b = parseInt(hex.substring(6, 8), 16);
                const newR = Math.round(r + (255 - r) * factor).toString(16).padStart(2, '0').toUpperCase();
                const newG = Math.round(g + (255 - g) * factor).toString(16).padStart(2, '0').toUpperCase();
                const newB = Math.round(b + (255 - b) * factor).toString(16).padStart(2, '0').toUpperCase();
                return `FF${newR}${newG}${newB}`;
            };

            const softColor = lighten(bgColor);

            rows.forEach((row) => {
                const cell = row.getCell(col);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: softColor },
                };
                cell.border = {
                    left: { style: 'medium', color: { argb: bgColor } },
                    right: { style: 'medium', color: { argb: bgColor } },
                    bottom: { style: 'thin', color: { argb: row.getCell(col).value === '' ? 'FFEEEEEE' : 'FFDDDDDD' } }
                };
            });
        };

        // Track current row for each column
        let rowA = 11;
        let rowC = 11;

        instructions.forEach((instruction) => {
            const col = instruction.col;
            let currentRow = col === 1 ? rowA : rowC;
            const currentSectionRows = [];

            // Spacing before
            currentRow++;

            // Section Title
            const titleRow = wsInstructions.getRow(currentRow);
            const titleCell = titleRow.getCell(col);

            titleCell.value = `  ${instruction.title.text}`;
            titleRow.height = 30;
            titleCell.font = {
                bold: instruction.title.font.bold,
                size: instruction.title.font.size,
                color: instruction.title.font.color,
            };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: instruction.title.font.background.argb }
            };
            titleCell.border = {
                top: { style: 'medium', color: { argb: instruction.title.font.background.argb } },
                left: { style: 'medium', color: { argb: instruction.title.font.background.argb } },
                right: { style: 'medium', color: { argb: instruction.title.font.background.argb } }
            };
            titleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };

            // Content Rows
            instruction.content.forEach((text) => {
                currentRow++;
                const contentRow = wsInstructions.getRow(currentRow);
                const contentCell = contentRow.getCell(col);

                contentCell.value = `   ${text}`;
                contentRow.height = text === '' ? 10 : 25;
                currentSectionRows.push(contentRow);
            });

            // Spacing at end
            currentRow++;
            currentSectionRows.push(wsInstructions.getRow(currentRow));

            // Apply soft background
            colirizeRows(currentSectionRows, instruction.title.font.background.argb, col);

            // Update row tracker (with a bit of extra space after section)
            if (col === 1) rowA = currentRow + 1;
            else rowC = currentRow + 1;
        });





        // 0. Template Sheet (Main)
        const wsTemplates = workbook.addWorksheet('TREINO', {
            properties: {
                // green / success
                tabColor: { argb: '00FF00' }
            }
        });

        // 1. Database Sheet (Hidden)
        const wsDb = workbook.addWorksheet('EXERCISES_DATABASE'
            , {
                // state: 'hidden',

                properties: {
                    // orange / warning
                    tabColor: { argb: 'FFA500' }
                }

            }
        );
        wsDb.columns = [
            { header: '#', key: 'id', width: 10 },
            { header: 'Nome', key: 'nome', width: 40 },
            { header: 'Grupo Muscular', key: 'grupo', width: 25 },
            { header: 'Categoria', key: 'categoria' },
            { header: 'Equipamento', key: 'equipamento' },
            { header: 'Tipo de Força', key: 'forca_tipo' },
            { header: 'Músculo', key: 'musculo' },
            { header: 'Nível', key: 'nivel' }
        ];

        exercises.forEach((ex: Exercicio | any) => {
            console.log('ex = ', ex)

            wsDb.addRow({
                id: ex.id,
                nome: ex.nome,
                grupo: ex.grupo_muscular?.nome || '',
                categoria: ex.categoria?.nome || '',
                equipamento: ex.equipamento?.nome || '',
                forca_tipo: ex.forca_tipo?.nome || '',
                musculo: ex.musculo?.nome || '',
                nivel: ex.nivel?.nome || ''
            });
        });

        // 2. Templates Sheet (Main)
        wsTemplates.columns = [
            { header: 'Sessão', key: 'sessao', width: 10 },
            { header: 'Ordem', key: 'ordem', width: 10 },
            { header: 'Exercício', key: 'exercicio', width: 40 },
            { header: 'Séries', key: 'series', width: 10 },
            { header: 'Repetições', key: 'reps', width: 10 },
            { header: 'Descanso (seg)', key: 'descanso_seg', width: 15 },
            { header: 'Observações', key: 'observacoes', width: 40 }
        ];

        // Format Header
        wsTemplates.getRow(1).font = { bold: true };
        wsTemplates.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add an example row

        const buildTemplateRow = (sessao: string, ordem: number) => {
            return {
                sessao,
                ordem,
                exercicio: '',
                series: 4,
                reps: '10-12',
                descanso_seg: 60,
                observacoes: 'Execução lenta'
            }
        }

        new Array(8).fill('').map((_, i) => {
            wsTemplates.addRow(buildTemplateRow('A', i + 1));
        })

        // Add a separator row
        wsTemplates.addRow({})

        // Add another example row
        new Array(8).fill('').map((_, i) => {
            wsTemplates.addRow(buildTemplateRow('B', i + 1));
        })

        // 3. Add Data Validation (Dropdown) to 'exercicio' column (Column D, rows 2 to 1000)
        const exerciseCount = exercises.length;
        if (exerciseCount > 0) {
            const dropdownRange = `EXERCISES_DATABASE!$B$2:$B$${exerciseCount + 1}`;
            for (let i = 2; i <= 500; i++) {
                wsTemplates.getCell(`C${i}`).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [dropdownRange],
                    showErrorMessage: false,
                    errorTitle: 'Exercício Inválido',
                    error: 'Por favor, selecione um exercício da lista presente na aba EXERCISES_DATABASE.'
                };
            }
        }

        // 4. Generate buffer and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'MvK_Gym_Manager_Modelo_Treino.xlsx');
    }

    /**
     * Parses the Excel file and returns JSON data.
     */
    async parseExcel(file: File): Promise<TreinoImportRow[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const focusSheetName = 'TREINO';
                if (!workbook.SheetNames.includes(focusSheetName)) {
                    reject('Aba TREINO não encontrada na planilha.');
                    return;
                }

                const worksheet = workbook.Sheets[focusSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);


                console.log('jsonData = ', jsonData)

                const normalizedData: TreinoImportRow[] = jsonData.map((row: any) => ({
                    templateName: String(row['Nome do Modelo'] || '').trim(),
                    section: String(row['Sessão'] || '').trim().toUpperCase(),
                    order: Number(row['Ordem'] || 0),
                    exerciseName: String(row['Exercício'] || '').trim(),
                    sets: Number(row['Séries'] || 0),
                    reps: row['Repetições']?.toString().trim() || '',
                    rest: Number(row['Descanso (seg)'] || 0),
                    notes: row['Observações'] ? String(row['Observações']).trim() : undefined
                }));

                resolve(normalizedData);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Validates row data and checks for missing fields.
     */
    validateRows(rows: TreinoImportRow[]): { valid: TreinoImportRow[], invalid: TreinoImportRow[] } {
        const valid: TreinoImportRow[] = [];
        const invalid: TreinoImportRow[] = [];

        rows.forEach(row => {
            const errors: string[] = [];
            if (!row.templateName) errors.push('Nome do modelo obrigatório');
            if (!row.section) errors.push('Sessão obrigatória');
            if (isNaN(row.order) || row.order <= 0) errors.push('Ordem inválida');
            if (!row.exerciseName) errors.push('Exercício obrigatório');
            if (isNaN(row.sets) || row.sets <= 0) errors.push('Séries deve ser > 0');
            if (!row.reps) errors.push('Repetições obrigatório');

            if (errors.length > 0) {
                row.status = 'error';
                row.validationErrors = errors;
                invalid.push(row);
            } else {
                valid.push(row);
            }
        });

        return { valid, invalid };
    }

    /**
     * Performs exercise matching and fuzzy suggestions.
     */
    async matchExercises(rows: TreinoImportRow[], allExercises: Exercicio[]): Promise<TreinoImportRow[]> {
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        return rows.map(row => {
            const originalName = row.exerciseName || '';
            const normalizedRowName = normalize(originalName);
            const rowTokens = normalizedRowName.split(/\s+/).filter(t => t.length > 2); // Split into words > 2 chars

            // 1. Precise Match
            const exactMatch = allExercises.find(ex => normalize(ex.nome) === normalizedRowName);

            if (exactMatch) {
                row.status = 'ok';
                row.match = {
                    ...exactMatch,
                    img_url: exactMatch.img_url || exactMatch.midia_url || (exactMatch.midias_url?.length ? exactMatch.midias_url[0] : undefined)
                };
                row.exerciseId = exactMatch.id;
                row.suggestions = [];
            } else {
                // 2. Token-based / Fuzzy suggestions
                const suggestions = allExercises
                    .map(ex => {
                        const normalizedExName = normalize(ex.nome);
                        // Count how many tokens from the row exist in the exercise name
                        let tokenMatches = 0;
                        rowTokens.forEach(token => {
                            if (normalizedExName.includes(token)) tokenMatches++;
                        });

                        // Also use overall similarity as a tie-breaker or fallback
                        const similarity = this.calculateSimilarity(normalizedRowName, normalizedExName);

                        // Score based on token matches and similarity
                        const score = (tokenMatches * 2) + similarity;

                        return { ex, score, tokenMatches, similarity };
                    })
                    .filter(item => item.tokenMatches > 0 || item.similarity > 0.4)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map(item => ({
                        ...item.ex,
                        // Fallback image logic
                        img_url: item.ex.img_url || item.ex.midia_url || (item.ex.midias_url?.length ? item.ex.midias_url[0] : undefined)
                    }));

                if (suggestions.length > 0) {
                    row.status = 'warning';
                    row.suggestions = suggestions;
                } else {
                    row.status = 'error';
                    row.validationErrors = [...(row.validationErrors || []), 'Exercício não encontrado na base'];
                }
            }
            return row;
        });
    }

    private calculateSimilarity(s1: string, s2: string): number {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - this.editDistance(longer, shorter)) / longerLength;
    }

    private editDistance(s1: string, s2: string): number {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }
}

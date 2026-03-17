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

        // 1. Database Sheet (Hidden)
        const wsDb = workbook.addWorksheet('EXERCISES_DATABASE', { state: 'hidden' });
        wsDb.columns = [
            { header: 'exercise_id', key: 'id', width: 10 },
            { header: 'nome', key: 'nome', width: 40 },
            { header: 'grupo_muscular', key: 'grupo', width: 25 }
        ];

        exercises.forEach(ex => {
            wsDb.addRow({
                id: ex.id,
                nome: ex.nome,
                grupo: ex.grupo_muscular?.nome || ''
            });
        });

        // 2. Templates Sheet (Main)
        const wsTemplates = workbook.addWorksheet('TEMPLATE');
        wsTemplates.columns = [
            // { header: 'nome_do_modelo', key: 'nome_do_modelo', width: 25 },
            { header: 'sessao', key: 'sessao', width: 10 },
            { header: 'ordem', key: 'ordem', width: 10 },
            { header: 'exercicio', key: 'exercicio', width: 40 },
            { header: 'series', key: 'series', width: 10 },
            { header: 'reps', key: 'reps', width: 10 },
            { header: 'descanso_seg', key: 'descanso_seg', width: 15 },
            { header: 'observacoes', key: 'observacoes', width: 40 }
        ];

        // Format Header
        wsTemplates.getRow(1).font = { bold: true };
        wsTemplates.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add an example row
        wsTemplates.addRow({
            // nome_do_modelo: 'Exemplo Hipertrofia',
            sessao: 'A',
            ordem: 1,
            exercicio: '',
            series: 4,
            reps: '10-12',
            descanso_seg: 60,
            observacoes: 'Execução lenta'
        });

        // 3. Add Data Validation (Dropdown) to 'exercicio' column (Column D, rows 2 to 1000)
        const exerciseCount = exercises.length;
        if (exerciseCount > 0) {
            const dropdownRange = `EXERCISES_DATABASE!$B$2:$B$${exerciseCount + 1}`;
            for (let i = 2; i <= 500; i++) {
                wsTemplates.getCell(`D${i}`).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [dropdownRange],
                    showErrorMessage: true,
                    errorTitle: 'Exercício Inválido',
                    error: 'Por favor, selecione um exercício da lista database.'
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

                const firstSheetName = 'TEMPLATE';
                if (!workbook.SheetNames.includes(firstSheetName)) {
                    reject('Aba TEMPLATE não encontrada na planilha.');
                    return;
                }

                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const normalizedData: TreinoImportRow[] = jsonData.map((row: any) => ({
                    templateName: String(row.nome_do_modelo || '').trim(),
                    section: String(row.sessao || '').trim().toUpperCase(),
                    order: Number(row.ordem) || 0,
                    exerciseName: String(row.exercicio || '').trim(),
                    sets: Number(row.series) || 0,
                    reps: String(row.reps || '').trim(),
                    rest: Number(row.descanso_seg) || 0,
                    notes: row.observacoes ? String(row.observacoes).trim() : undefined
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
        return rows.map(row => {
            const name = row.exerciseName.toLowerCase();

            // Exact Match (including normalization)
            const exactMatch = allExercises.find(ex =>
                ex.nome.toLowerCase() === name ||
                ex.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            );

            if (exactMatch) {
                row.status = 'ok';
                row.match = exactMatch;
                row.exerciseId = exactMatch.id;
                row.suggestions = [];
            } else {
                // Fuzzy Match / Suggestions
                const suggestions = allExercises.filter(ex =>
                    ex.nome.toLowerCase().includes(name) ||
                    name.includes(ex.nome.toLowerCase()) ||
                    this.calculateSimilarity(name, ex.nome.toLowerCase()) > 0.6
                ).slice(0, 5);

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

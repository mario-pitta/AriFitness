import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ConfettiService } from 'src/core/services/confetti/confetti.service';

interface ImportRow {
    selected: boolean;
    nome: string;
    cpf: string;
    whatsapp?: string;
    plano?: string;
    horario?: string;
    data_nascimento?: string;
    genero?: string;
    invalidFields: string[];
    errorDescription?: string;
    processedData?: any;
}

@Component({
    selector: 'app-importar',
    templateUrl: './importar.page.html',
    styleUrls: ['./importar.page.scss'],
})
export class ImportarPage implements OnInit {
    currentStep: 'upload' | 'preview' | 'success' = 'upload';
    empresaId: string = '';
    importData: ImportRow[] = [];
    planos: any[] = [];
    horarios: any[] = [];
    isLoading = false;
    isProcessing = false;
    selectAll = true;

    constructor(
        private usuarioService: UsuarioService,
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router,
        private confetti: ConfettiService
    ) { }

    ngOnInit() {
        const user = this.authService.getUser;
        if (user?.empresa_id) {
            this.empresaId = user.empresa_id;
            this.loadMappings();
        } else {
            this.toastr.error('Empresa não identificada.');
            this.router.navigate(['/tabs/usuarios']);
        }
    }

    loadMappings() {
        this.usuarioService.getMappings(this.empresaId).subscribe({
            next: (res: any) => {
                this.planos = res.planos || [];
                this.horarios = res.horarios || [];
            },
            error: () => this.toastr.error('Erro ao carregar dados auxiliares.')
        });
    }

    goBack() {
        this.router.navigate(['/tabs/usuarios']);
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file: File) {
        this.isProcessing = true;
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            this.importData = (data as any[]).map(row => this.validateAndMap(row));
            console.log('this.importData = ', this.importData)

            this.isProcessing = false;
            if (this.importData.length > 0) {
                this.currentStep = 'preview';
            } else {
                this.toastr.warning('Nenhum dado encontrado na planilha.');
            }
        };
        reader.readAsBinaryString(file);
    }

    private excelDateToJSDate(serial: any) {
        if (!serial || isNaN(serial)) return null;
        const date = new Date((serial - 25569) * 86400 * 1000);
        return date;
    }

    private timeToMinutes(timeStr: string): number | null {
        if (!timeStr) return null;

        if (!isNaN(Number(timeStr)) && Number(timeStr) < 1) {
            const totalMinutes = Math.round(Number(timeStr) * 24 * 60);
            return totalMinutes;
        }

        const match = timeStr.toString().match(/(\d{1,2})[h:](\d{2})?/i);
        if (!match) return null;

        const hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        return hours * 60 + minutes;
    }

    private findClosestSchedule(list: any[], value: any): any {
        const inputMinutes = this.timeToMinutes(value);
        if (inputMinutes === null) return null;

        let closestMatch = null;
        let minDiff = Infinity;

        for (const schedule of list) {
            const scheduleMinutes = this.timeToMinutes(schedule.hora_inicio);
            if (scheduleMinutes === null) continue;

            const diff = Math.abs(inputMinutes - scheduleMinutes);
            if (diff < minDiff) {
                minDiff = diff;
                closestMatch = schedule;
            }
        }
        return minDiff <= 120 ? closestMatch : null;
    }

    private findGenericMatch(list: any[], value: any, key: string): any {
        if (!value) return null;
        const search = value.toString().toLowerCase().trim();

        let match = list.find(item => item[key]?.toString().toLowerCase().trim() === search);
        if (match) return match;

        match = list.find(item => {
            const systemVal = item[key]?.toString().toLowerCase().trim();
            return systemVal && search.includes(systemVal);
        });
        if (match) return match;

        return list.find(item => {
            const systemVal = item[key]?.toString().toLowerCase().trim();
            return systemVal && systemVal.includes(search);
        });
    }

    validateAndMap(row: any): ImportRow {
        const nome = row["Nome completo "] || row["Nome"];
        const cpfRaw = row["  CPF  "] || row["CPF"];
        const whatsapp = row["  Telefone / WhatsApp  "] || row["WhatsApp"];
        const planoStr = row["  Plano do aluno  "] || row["Plano"];
        const horarioStr = row["  Horário do aluno  "] || row["Horário"];
        const dataNascRaw = row["  Data de nascimento  "] || row["Data de nascimento"];
        const genero = row["Gênero"] || row["genero"];
        const vencimento = row["  Vencimento da mensalidade  "] || row["Vencimento"];

        const planoMatch = this.findGenericMatch(this.planos, planoStr, 'descricao');
        const horarioMatch = this.findClosestSchedule(this.horarios, horarioStr);
        const data_nascimento = this.excelDateToJSDate(dataNascRaw);

        const importRow: ImportRow = {
            selected: true,
            nome,
            cpf: this.formatCPF(cpfRaw?.toString() || ''),
            whatsapp: whatsapp?.toString() || '',
            plano: planoStr,
            horario: horarioStr,
            data_nascimento: data_nascimento?.toLocaleDateString(),
            genero,
            invalidFields: [],
            errorDescription: '',
            processedData: {
                nome: nome,
                cpf: cpfRaw?.toString().replace(/\D/g, ''),
                whatsapp: whatsapp?.toString().replace(/\D/g, ''),
                plano: planoMatch?.id,
                horario_id: horarioMatch?.id,
                data_nascimento: data_nascimento,
                genero: genero || 'M',
                data_vencimento: vencimento ? Number(vencimento) : null,
                peso: row["  Peso  "] ? parseFloat(row["  Peso  "].toString().replace('kg', '')) : null,
                fumante: row["É tabagista?  "] === 'Sim',
                dac: row["Possui histórico familiar de doença coronariana ou hipertensão?  "] === 'Sim',
                diabete: row["  Possui doença em tratamento contínuo?  "]?.toString().toLowerCase().includes('diabete'),
                avc: row["Apresenta ou já apresentou episódios de desmaios ou vertigens?  "] === 'Sim',
                relato_dor: row["  Possui alguma dor ou desconforto sem causa definida?  "] === 'Sim',
                fl_pratica_atividade_fisica: row["  Pratica exercícios físicos?  "] === 'Sim',
                tipo_alimentacao: row["  Alimentação regular e adequada?   "],
                objetivo: row["Se sim, qual tipo de atividade física você costuma praticar?"],
            }
        };

        this.validateRow(importRow);
        return importRow;
    }

    validateRow(row: ImportRow) {
        row.invalidFields = [];
        const errors: string[] = [];

        if (!row.processedData.nome) {
            row.invalidFields.push('nome');
            errors.push('Nome obrigatório');
        }

        if (!row.processedData.cpf) {
            row.invalidFields.push('cpf');
            errors.push('CPF obrigatório');
        } else if (row.processedData.cpf.length !== 11) {
            row.invalidFields.push('cpf');
            errors.push('CPF inválido (11 dígitos)');
        }

        if (!row.processedData.plano && row.plano) {
            row.invalidFields.push('plano');
            errors.push('Plano não reconhecido');
        }

        if (!row.processedData.horario_id && row.horario) {
            row.invalidFields.push('horario');
            errors.push('Horário não reconhecido');
        }

        row.errorDescription = errors.join(', ');
        if (row.invalidFields.length > 0) {
            row.selected = false;
        }
    }

    private formatCPF(value: string): string {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }

    updateRowField(row: ImportRow, field: string, value: any) {
        if (field === 'nome') {
            row.processedData.nome = value;
            row.nome = value;
        } else if (field === 'cpf') {
            const onlyNumbers = value.replace(/\D/g, '');
            row.processedData.cpf = onlyNumbers;
            row.cpf = this.formatCPF(onlyNumbers);
        } else if (field === 'plano_id') {
            row.processedData.plano = value;
            const plano = this.planos.find(p => p.id === value);
            row.plano = plano?.descricao;
        } else if (field === 'horario_id') {
            row.processedData.horario_id = value;
            const horario = this.horarios.find(h => h.id === value);
            row.horario = horario?.hora_inicio;
        }

        this.validateRow(row);
    }

    toggleAll() {
        this.importData.forEach(row => {
            if (row.invalidFields.length === 0) {
                row.selected = this.selectAll;
            } else {
                row.selected = false;
            }
        });
    }

    get canImport() {
        return this.importData.some(row => row.selected);
    }

    get selectedCount() {
        return this.importData.filter(row => row.selected).length;
    }

    import() {
        if (!this.canImport) return;

        this.isLoading = true;
        const students = this.importData.filter(row => row.selected).map(row => row.processedData);

        this.usuarioService.batchCreate(students, this.empresaId).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.errors.length > 0) {
                    res.errors.forEach((err: any) => {
                        const rowMatch = this.importData.find(r => r.nome === err.row);
                        if (rowMatch) {
                            rowMatch.errorDescription = err.reason;
                            rowMatch.selected = false;
                            rowMatch.invalidFields.push('backend-error');
                        }
                    });
                    this.toastr.warning(`${res.success.length} importados, ${res.errors.length} erros.`);
                } else {
                    this.toastr.success(`${res.success.length} alunos importados com sucesso!`);
                    this.confetti.showConfetti();
                    this.currentStep = 'success';
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.toastr.error('Erro ao salvar alunos: ' + err.message);
            }
        });
    }

    reset() {
        this.importData = [];
        this.currentStep = 'upload';
        this.selectAll = true;
    }
}

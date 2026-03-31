import { Component, OnInit } from '@angular/core';
import { TreinoImportService, TreinoImportRow } from 'src/core/services/treino/treino-import.service';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Exercicio } from 'src/core/models/Exercicio';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { take } from 'rxjs';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { Router } from '@angular/router';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { Treino } from 'src/core/models/Treino';
import { CanComponentDeactivate } from 'src/core/guards/pending-changes.guard';

@Component({
    selector: 'app-importacao',
    templateUrl: './importacao.page.html',
    styleUrls: ['./importacao.page.scss'],
})
export class ImportacaoPage implements OnInit, CanComponentDeactivate {
    allExercises: Exercicio[] = [];
    importedRows: TreinoImportRow[] = [];
    groupedTemplates: any = {};

    loading: boolean = false;
    isProcessing: boolean = false;
    showEditor: boolean = false;
    isWorkoutValid: boolean = false;

    stats = {
        total: 0,
        ok: 0,
        warning: 0,
        error: 0
    };

    constructor(
        private importService: TreinoImportService,
        private exercicioService: ExercicioService,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private treinoService: TreinoService,
        private router: Router,
        private workoutState: WorkoutTemplateStateService
    ) { }

    ngOnInit() {
        this.loadExercises();
        this.workoutState.isValid$.subscribe(valid => {
            console.log('Component Validation State:', valid);
            this.isWorkoutValid = valid;
        });
    }

    loadExercises() {
        this.exercicioService.find({ limit: 2000 }).pipe(take(1)).subscribe(ex => {
            this.allExercises = ex;
        });
    }

    async downloadTemplate() {
        await this.importService.downloadTemplate();
        const toast = await this.toastCtrl.create({
            message: 'Template baixado com sucesso!',
            duration: 2000,
            color: 'success'
        });
        toast.present();
    }

    async onFileChange(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.isProcessing = true;
        const loading = await this.loadingCtrl.create({
            message: 'Processando planilha...'
        });
        await loading.present();

        try {
            const rows = await this.importService.parseExcel(file);
            const validated = this.importService.validateRows(rows);




            // Match exercises
            const allRows = await this.importService.matchExercises([...validated.valid, ...validated.invalid], this.allExercises);

            this.importedRows = allRows;
            this.updateStats();
            this.groupData();

            const templateKeys = Object.keys(this.groupedTemplates);
            if (templateKeys.length > 0) {
                // Automatically open the first template in the editor
                this.prepararRevisao(templateKeys[0]);

                if (templateKeys.length > 1) {
                    const toast = await this.toastCtrl.create({
                        message: 'Apenas o primeiro modelo encontrado foi carregado.',
                        duration: 3000,
                        color: 'warning'
                    });
                    toast.present();
                }
            } else {
                throw new Error('Nenhum dado de treino encontrado na planilha.');
            }
        } catch (error) {
            console.error(error);
            const alert = await this.alertCtrl.create({
                header: 'Erro ao processar planilha. Experimente utilizar o modelo padrão. Caso o erro persista, entre em contato com o suporte.',
                message: String(error),
                buttons: ['OK']
            });
            await alert.present();
        } finally {
            this.isProcessing = false;
            loading.dismiss();
            event.target.value = ''; // Reset input
        }
    }

    updateStats() {
        this.stats.total = this.importedRows.length;
        this.stats.ok = this.importedRows.filter(r => r.status === 'ok').length;
        this.stats.warning = this.importedRows.filter(r => r.status === 'warning').length;
        this.stats.error = this.importedRows.filter(r => r.status === 'error').length;
    }

    groupData() {
        const groups: any = {};

        this.importedRows.forEach((row, index) => {
            const tName = row.templateName || 'Sem Nome';
            if (!groups[tName]) groups[tName] = { name: tName, sections: {} };

            const sName = row.section || 'Geral';
            if (!groups[tName].sections[sName]) groups[tName].sections[sName] = [];

            groups[tName].sections[sName].push({ ...row, originalIndex: index });
        });

        // Sort exercises by order
        Object.keys(groups).forEach(t => {
            Object.keys(groups[t].sections).forEach(s => {
                groups[t].sections[s].sort((a: any, b: any) => a.order - b.order);
            });
        });

        this.groupedTemplates = groups;
    }

    prepararRevisao(templateKey: string) {
        const group = this.groupedTemplates[templateKey];
        if (!group) return;

        const currentUser = JSON.parse(localStorage.getItem('user_details') || '{}');

        const previewTreino: any = {
            id: 0,
            nome: templateKey,
            empresa_id: currentUser.empresa_id,
            fl_ativo: true,
            fl_publico: true,
            nivel_dificuldade: 1,
            descricao: `Importado via planilha em ${new Date().toLocaleDateString()}`,
            sessoes: []
        };

        Object.keys(group.sections).forEach((sName, sIdx) => {
            const sectionRows = group.sections[sName];
            const session: any = {
                nome: sName,
                ordem: sIdx + 1,
                exercicios: sectionRows.map((r: any) => ({
                    exercicio_id: r.match?.id || 0,
                    exercicio: r.match || { nome: r.exerciseName, id: 0, },
                    series: r.sets || 0,
                    repeticoes: r.reps || '0',
                    intervalo: r.rest || 0,
                    ordem: r.order,
                    tipo_execucao: 1,
                    tipo_progressao: 1,
                    sugestoes: r.suggestions
                }))
            };
            previewTreino.sessoes.push(session);
        });

        this.workoutState.setWorkout(previewTreino);
        this.showEditor = true;
    }

    async saveImportedTreino() {
        const workout = this.workoutState.getWorkoutValue();
        if (!workout) return;

        this.loading = true;
        const loadingCtrl = await this.loadingCtrl.create({ message: 'Salvando treino...' });
        await loadingCtrl.present();

        this.treinoService.create(workout).subscribe({
            next: () => {
                this.loading = false;
                loadingCtrl.dismiss();
                this.toastCtrl.create({
                    message: 'Treino importado e salvo com sucesso!',
                    duration: 3000,
                    color: 'success'
                }).then(t => t.present());

                this.resetProcess();
                this.router.navigate(['/admin/treinos']);
            },
            error: (err) => {
                this.loading = false;
                loadingCtrl.dismiss();
                this.alertCtrl.create({
                    header: 'Erro ao Salvar',
                    message: 'Não foi possível salvar o treino importado.',
                    buttons: ['OK']
                }).then(a => a.present());
            }
        });
    }

    resetProcess() {
        this.showEditor = false;
        this.importedRows = [];
        this.groupedTemplates = {};
        this.updateStats();
        this.workoutState.setWorkout(null);
    }

    ngOnDestroy() {
        this.resetProcess();
    }

    async canDeactivate(): Promise<boolean> {
        console.log('ImportacaoPage.canDeactivate called. showEditor:', this.showEditor, 'importedRows:', this.importedRows.length);

        if (this.showEditor || this.importedRows.length > 0) {
            const alert = await this.alertCtrl.create({
                header: 'Sair e perder?',
                message: 'Você possui uma importação em andamento. Se sair agora, todos os dados importados e edições serão perdidos.',
                buttons: [
                    { text: 'Ficar', role: 'cancel' },
                    { text: 'Sair e Perder', role: 'destructive', handler: () => true }
                ]
            });
            await alert.present();
            const { role } = await alert.onDidDismiss();
            return role === 'destructive';
        }
        return true;
    }
}

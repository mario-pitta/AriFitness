import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { IUsuario } from 'src/core/models/Usuario';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { NavController } from '@ionic/angular';
import { FichaAlunoService } from 'src/core/services/ficha-aluno/ficha-aluno.service';

@Component({
    selector: 'app-historico-aluno',
    templateUrl: './historico-aluno.page.html',
    styleUrls: ['./historico-aluno.page.scss'],
})
export class HistoricoAlunoPage implements OnInit {
    userId: number | null = null;
    aluno: IUsuario | null = null;
    activeSegment: string = 'frequencia';

    // Loading states
    loading: boolean = false;
    loadingFrequency: boolean = false;
    loadingEvolution: boolean = false;
    loadingFichas: boolean = false;

    // Data
    treinoHistory: any[] = []; // Check-in logs
    workoutLogs: any[] = [];   // Actual workout execution logs (loads/reps)
    fichasHistory: any[] = []; // History of training cards
    chartData: any[] = [];     // Formatted data for charts

    userCpf: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private usuarioService: UsuarioService,
        private fichaAlunoService: FichaAlunoService,
        public toastr: ToastrService,
        private navCtrl: NavController
    ) { }

    ngOnInit() {
        this.userId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.userId) {
            this.loadAllData();
        }
    }

    async loadAllData() {
        this.loading = true;

        // Fetch User Info first to get CPF
        this.usuarioService.findByFilters({ id: this.userId! }).subscribe({
            next: (res: any) => {
                if (res.data && res.data.length > 0) {
                    this.aluno = res.data[0];
                    this.userCpf = this.aluno!.cpf;

                    // Parallel loads
                    this.getTreinoHistory(); // Frequency
                    this.getWorkoutLogs();   // Load Evolution
                    this.getFichasHistory(); // Card History
                }
                this.loading = false;
            },
            error: (err) => {
                this.toastr.error('Erro ao carregar dados do aluno');
                this.loading = false;
            }
        });
    }

    getTreinoHistory() {
        this.loadingFrequency = true;
        this.usuarioService.getFrequencyByCPF(this.userCpf!).subscribe({
            next: (res: any) => {
                this.treinoHistory = res.data || [];
                this.loadingFrequency = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingFrequency = false;
            }
        });
    }

    getWorkoutLogs() {
        this.loadingEvolution = true;
        this.usuarioService.getTreinoHistorico(this.userId!).subscribe({
            next: (res: any) => {
                this.workoutLogs = res || [];
                this.processEvolutionData();
                this.loadingEvolution = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingEvolution = false;
            }
        });
    }

    getFichasHistory() {
        this.loadingFichas = true;
        this.fichaAlunoService.getByUser(this.userId!).subscribe({
            next: (data: any) => {
                this.fichasHistory = (data || []).sort((a: any, b: any) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                this.processEvolutionData();
                this.loadingFichas = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingFichas = false;
            }
        });
    }

    processEvolutionData() {
        if (!this.fichasHistory || this.fichasHistory.length === 0) {
            this.chartData = [];
            return;
        }

        const groups = new Map<string, { date: number, label: string, value: number }[]>();

        this.fichasHistory.forEach(ficha => {
            const date = new Date(ficha.created_at).getTime();
            const label = new Date(ficha.created_at).toLocaleDateString('pt-BR');

            ficha.sessoes?.forEach((sessao: any) => {
                sessao.exercicios?.forEach((ex: any) => {
                    const name = ex.exercicio?.nome;
                    if (!name) return;

                    if (!groups.has(name)) groups.set(name, []);

                    // Avoid duplicate exercise entries within the same card for the chart
                    const entryIdx = groups.get(name)!.findIndex(p => p.label === label);
                    const carga = Number(ex.carga) || 0;

                    if (entryIdx >= 0) {
                        groups.get(name)![entryIdx].value = Math.max(groups.get(name)![entryIdx].value, carga);
                    } else {
                        groups.get(name)!.push({ date, label, value: carga });
                    }
                });
            });
        });

        // Convert Map to ngx-charts format, filtering for exercises with at least 2 data points for evolution
        this.chartData = Array.from(groups.entries())
            .map(([name, points]) => ({
                name,
                series: points
                    .sort((a, b) => a.date - b.date)
                    .map(p => ({
                        name: p.label,
                        value: p.value
                    }))
            }))
            .filter(g => g.series.length > 1)
            .slice(0, 5); // Limit to top 5 evolved exercises to avoid clutter
    }

    segmentChanged(ev: any) {
        this.activeSegment = ev.detail.value;
    }

    goBack() {
        this.navCtrl.back();
    }

    getAttendanceCount(): number {
        return this.treinoHistory.length;
    }

    getMonthlyAttendance(): number {
        const now = new Date();
        return this.treinoHistory.filter(h => {
            const d = new Date(h.data_hora);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
    }
}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class HistoricoAlunoPage implements OnInit, OnChanges {
    @Input() userId: number | null = null;
    @Input() showHeader: boolean = true;
    @Output() onViewFicha = new EventEmitter<number>();

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
        if (!this.userId) {
            this.userId = Number(this.route.snapshot.paramMap.get('id'));
        }

        if (this.userId) {
            this.loadAllData();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['userId'] && changes['userId'].currentValue) {
            this.userId = changes['userId'].currentValue;
            this.loadAllData();
        }
    }

    async loadAllData() {
        this.loading = true;

        // Fetch User Info first to get CPF
        this.usuarioService.findByFilters({ id: this.userId! }).subscribe({
            next: (res: any) => {


                console.log('res = ', res)
                if (res && res.length > 0) {
                    this.aluno = res[0];
                    this.userCpf = this.aluno!.cpf;

                    console.log('this.userCpf = ', this.userCpf)

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
        this.usuarioService.getFrequencyByCPF(this.userCpf!, this.aluno!.empresa_id as string).subscribe({
            next: (res: any) => {
                this.treinoHistory = res || [];
                this.loadingFrequency = false;
            },
            error: (err) => {
                console.error(err);
                this.loadingFrequency = false;
            }
        });
    }

    getWorkoutLogs() {
        this.loadingEvolution = false;
        // this.usuarioService.getTreinoHistorico(this.userId!).subscribe({
        //     next: (res: any) => {

        //         console.log('getTreinoHistorico res = ', res)

        //         this.workoutLogs = res || [];
        //         this.processEvolutionData();
        //         this.loadingEvolution = false;
        //     },
        //     error: (err) => {
        //         console.error(err);
        //         this.loadingEvolution = false;
        //     }
        // });
    }

    getFichasHistory() {
        this.loadingFichas = true;
        this.fichaAlunoService.getByUser(this.userId!).subscribe({
            next: (data: any) => {

                console.log('fichaAlunoService data = ', data)

                this.fichasHistory = (data || []).sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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


        console.log(' this.fichasHistory = ', this.fichasHistory)


        const groups = new Map<string, { date: number, label: string, value: number, evolution: number }[]>();

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
                        groups.get(name)!.push({ date, label, value: carga, evolution: 0 });
                    }


                    console.log('ex = ', ex)
                });
            });
        });

        const _exercises = Array.from(groups.entries()).map(([name, points], index) => {
            // Sort points from oldest to newest to calculate evolution correctly
            const sortedPoints = points.sort((a, b) => a.date - b.date);
            const evolution = sortedPoints[sortedPoints.length - 1].value - sortedPoints[0].value;

            console.log('name = ', name);
            console.log('sortedPoints = ', sortedPoints);
            console.log('primeira execução (mais antiga): points[0] = ', sortedPoints[0]);
            console.log('última execução (mais recente): points[points.length - 1] = ', sortedPoints[sortedPoints.length - 1]);
            console.log('evolução calculada = ', evolution);

            return {
                name: name,
                series: sortedPoints,
                evolution: evolution
            };
        });


        console.log('exercises = ', _exercises)

        // Convert Map to ngx-charts format, filtering for exercises with at least 2 data points for evolution
        this.chartData = _exercises
            .map(ex => ({
                name: ex.name,
                evolution: ex.evolution,
                series: ex.series
                    .sort((a, b) => a.date - b.date)
                    .map(p => ({
                        name: p.label,
                        value: p.value
                    }))
            }))
            .filter(g => g.series.length > 1 && g.evolution > 0)
            .sort((a, b) => b.evolution - a.evolution)
            .slice(0, 10); // Limit to top 5 evolved exercises to avoid clutter


        console.log('this.chartData = ', this.chartData)

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

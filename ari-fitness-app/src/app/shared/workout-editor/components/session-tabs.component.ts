
import { Component, OnInit } from '@angular/core';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { TreinoSessao } from 'src/core/models/TreinoSessao';
import { AlertController } from '@ionic/angular';
import { SessionStateService } from 'src/core/services/treino/state/session-state.service';

@Component({
    selector: 'app-session-tabs',
    templateUrl: './session-tabs.component.html',
    styleUrls: ['./session-tabs.component.scss']
})
export class SessionTabsComponent implements OnInit {
    sessoes: TreinoSessao[] = [];
    activeSession: TreinoSessao | null = null;

    constructor(
        private workoutState: WorkoutTemplateStateService,
        private sessionState: SessionStateService,
        private alertController: AlertController
    ) { }

    ngOnInit() {
        this.workoutState.workout$.subscribe(workout => {
            this.sessoes = workout?.sessoes || [];
        });
        this.workoutState.activeSession$.subscribe(session => {
            this.activeSession = session;
        });
    }

    selectSession(session: TreinoSessao) {
        this.workoutState.setActiveSession(session);
    }

    async addSession() {
        const nextLetter = String.fromCharCode(65 + this.sessoes.length); // A, B, C...

        const nextOrdem = this.sessoes.length > 0
            ? Math.max(...this.sessoes.map(s => s.ordem)) + 1
            : 1;

        const alert = await this.alertController.create({
            header: 'Nova Sessão',
            inputs: [
                {
                    name: 'nome',
                    type: 'text',
                    placeholder: 'Nome da sessão (ex: Peito e Tríceps)',
                    value: nextLetter
                }
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Criar',
                    handler: (data) => {
                        const newSession: TreinoSessao = {
                            nome: data.nome,
                            ordem: nextOrdem,
                            treino_id: this.workoutState.getWorkoutValue()?.id || 0,
                            exercicios: []
                        };
                        this.workoutState.addSession(newSession);
                    }
                }
            ]
        });
        await alert.present();
    }

    async optionsSession(session: TreinoSessao, event: Event) {
        event.stopPropagation();
        const alert = await this.alertController.create({
            header: `Sessão ${session.nome}`,
            buttons: [
                {
                    text: 'Duplicar',
                    handler: () => this.sessionState.duplicateSession(session)
                },
                {
                    text: 'Renomear',
                    handler: () => this.renameSession(session)
                },
                {
                    text: 'Excluir',
                    role: 'destructive',
                    cssClass: 'text-danger',
                    handler: () => this.workoutState.removeSession(session.id, session.ordem)
                },
                { text: 'Cancelar', role: 'cancel' }
            ]
        });
        await alert.present();
    }

    async renameSession(session: TreinoSessao) {
        const alert = await this.alertController.create({
            header: 'Renomear Sessão',
            inputs: [{ name: 'nome', type: 'text', value: session.nome }],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Salvar',
                    handler: (data) => {
                        this.workoutState.updateSession({ ...session, nome: data.nome });
                    }
                }
            ]
        });
        await alert.present();
    }
}

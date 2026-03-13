import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { TreinoExercicioFormPage } from '../treino-exercicio-form/treino-exercicio-form.page';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ConfettiService } from 'src/core/services/confetti/confetti.service';

import { Exercicio } from 'src/core/models/Exercicio';
import { Historico } from 'src/core/models/Historico';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';

@Component({
  selector: 'app-treinos',
  templateUrl: './treinos.page.html',
  styleUrls: ['./treinos.page.scss'],
})
export class TreinosPage implements OnInit {
  user!: IUsuario;
  selectedTreino: any;
  interval: any;
  openModal: boolean = false;
  selectedExercicio: any | Exercicio;
  historico: Historico[] = [];
  constructor(
    private auth: AuthService,
    private modalController: ModalController,
    private router: Router,
    private aRoute: ActivatedRoute,
    private confettiService: ConfettiService,
    private usuarioService: UsuarioService
  ) {
    this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.onTreinoSelected(
          this.aRoute.snapshot.queryParamMap.get('treinoId')
        );
      }
    });
  }

  ngOnInit() {
    console.log('iniciando treinosPage');
    this.user = this.auth.getUser;
    console.log(this.user);
    this.onTreinoSelected(this.aRoute.snapshot.queryParamMap.get('treinoId'));
    // this.selectedTreino =
    //   this.user?.ficha_aluno &&
    //   this.user.ficha_aluno[0].treinos.find((t: any) => t.treino.id == event).treino;
    console.log(this.selectedTreino);
  }

  counter: number = 15;
  icon: string = 'play';

  onTreinoSelected(event: any) {
    console.log(event);

    console.log('this.user: ', this.user);
    const ficha = this.user?.ficha_aluno?.filter((f) => f.fl_ativo && f.treinos.length > 0)[0];
    console.log('ficha: ', ficha);

    this.selectedTreino = ficha?.treinos.find(
      (t: any) => t.treino.id == event
    )?.treino;
    console.log('selectedTreino ============ ', this.selectedTreino);
  }
  serieArr: any[] = [];

  toggleClock(time: number) {
    console.log(this.interval);
    if (this.interval) {
      this.clearInterval(this.interval);
      this.interval = null;
      this.icon = 'play';
    } else {
      this.icon = 'pause';
      this.interval = setInterval(async () => {
        if (this.counter > 0) {
          this.counter--;
          if (this.counter < 4) {
            if (this.counter > 0) {
              await this.playSound('som-de-sino-2.mp3');
            } else {
              await this.playSound('som-de-sino-1.mp3');
            }
          }
        } else {
          // confetti({

          // })
          this.resetCounter();
        }
      }, 1000);
    }
  }

  buildSerieArr(ex: any) {
    this.serieArr = Array(ex.series)
      .fill(1)
      .map((i, index) => {
        return {
          concluido: false,
          index: index + 1,
        };
      });
  }

  playSound(sound: string) {
    const path = '../../assets/audios/' + sound;
    const audio = new Audio(path);
    console.log('pronto pra tocar', audio);
    audio.play();
    // document.body.removeChild(audio);
  }

  setInterval(e: any) {
    this.interval = e.value;
    console.log(this.interval);
    console.log(this.interval);
  }

  enableRotation(el: any) {
    el.target.style.setProperty('--rotation-duration', `${this.interval}s`);
    el.target.style.setProperty('--color', `warning`);
    el.target.classList.toggle('clock-animated');

    setTimeout(() => { }, this.interval);
  }

  resetCounter() {
    this.icon = 'play';
    // this.selectedExercicio = null;
    this.counter = this.selectedExercicio.intervalo || 15;
    this.clearInterval(this.interval);
  }

  clearInterval(interval: any) {
    if (interval) {
      clearInterval(interval);
      this.interval = null;
    }
  }

  exercicioPresets: any = {};
  buildExercicioPresets() {
    console.log('this.selectedExercicio', this.selectedExercicio);
    this.exercicioPresets = {
      carga: this.selectedExercicio.carga,
      repeticoes: this.selectedExercicio.repeticoes,
      series: this.selectedExercicio.series,
      intervalo: this.selectedExercicio.intervalo,
    };
    this.buildSerieArr(this.selectedExercicio);
  }

  selectExercicio(ex: any) {
    this.confettiService.clearConfetti();
    ex.exercicio.concluido = false;
    this.selectedExercicio = ex;
    this.counter = ex.intervalo;
    this.openModal = true;
  }

  // openTreinoForm() {
  //   this.confettiService.clearConfetti();
  //   this.modalController
  //     .create({
  //       component: TreinoExercicioFormPage,
  //     })
  //     .then((modal) => {
  //       modal.present();
  //     });
  // }

  checkAllExercicios(): boolean {
    return this.selectedTreino?.treino_exercicio?.every(
      (ex: any) => ex.exercicio.concluido
    );
  }

  checkAllSeries() {
    return this.serieArr.some((serie) => !serie.concluido);
  }

  finishExercicio() {
    const historico: Historico = {
      aluno: this.user,
      treino: this.selectedTreino,
      exercicio: this.selectedExercicio.exercicio,
      series: this.exercicioPresets.series,
      repeticao: this.exercicioPresets.repeticoes,
      carga: this.exercicioPresets.carga || 0,
      intervalo: this.exercicioPresets.intervalo,
      nivel_dificuldade: this.selectedExercicio.nivel_dificuldade,
      data: new Date().toLocaleString(),
    };

    console.log('historico: ', historico);

    // Persist to backend
    this.usuarioService.registrarTreinoHistorico({
      usuario_id: this.user.id,
      treino_id: this.selectedTreino.id,
      exercicio_id: this.selectedExercicio.exercicio.id,
      series: historico.series,
      repeticao: historico.repeticao,
      carga: historico.carga,
      intervalo: historico.intervalo,
      nivel_dificuldade: historico.nivel_dificuldade,
      empresa_id: this.user.empresa_id
    }).subscribe();

    this.historico.push(historico);

    this.selectedExercicio.exercicio.concluido = true;
    this.modalController.dismiss();
    this.confettiService.showConfetti();
  }

  finishTreino() {
    console.log('finishTreino');
    this.auth.updateUser({
      ...this.user,
      historico: this.user.historico?.concat(this.historico) || this.historico,
    });
    this.confettiService.showConfetti();
    history.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Constants from 'src/core/Constants';
import { Treino } from 'src/core/models/Treino';
import { ITeamMember, IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { PagetitleService } from 'src/core/services/pagetitle.service';


export enum MALE_BG_URLS {
  PEITO = 'https://img.freepik.com/free-photo/front-view-fit-shirtless-man-showing-pecs_23-2148700660.jpg?t=st=1725675231~exp=1725678831~hmac=11fb88009a9440986491177152c0a157dc42d2ad396c8bfd5a0c346c29c260d3&w=1380',
  COSTAS = 'https://img.freepik.com/free-photo/person-standing-dark-room_140725-7924.jpg?t=st=1725659536~exp=1725663136~hmac=033c7d84d0dc21ab498123d4e0997f5974b3dc8bac3c01a01cf5b913431419e4&w=740',
  BRACOS = 'https://img.freepik.com/free-photo/young-bodybuilder-with-muscular-arms_1163-3563.jpg?t=st=1725674890~exp=1725678490~hmac=1ca104c92ced2d8d6081c4830da092d4338774a54a318417f8e2504d89cfc9ae&w=1380',
  PERNAS = 'https://img.freepik.com/free-photo/portrait-muscle-man-body-white-background_613910-7447.jpg?t=st=1725675405~exp=1725679005~hmac=d3bcd67423a61517e2bd68e6f22bd5f7e3a2d3998d4a5c962df444eea55f8097&w=1060',
  GLUTEOS = 'https://img.freepik.com/free-photo/close-up-sexy-incognito-female-model-wearing-sports-black-underwear-standing-isolated-black-studio-background-back-view-fit-caucasian-woman-with-perfect-buttocks-posing_7502-9007.jpg?t=st=1725675494~exp=1725679094~hmac=8d0612a30b5a2410dfb86014c775dad776532e33d9c35a4b1c967262e5a23e66&w=1380',
  ABDOMINAL = 'https://img.freepik.com/free-photo/full-shot-man-doing-exercise-gym_23-2149734698.jpg?t=st=1725675295~exp=1725678895~hmac=65dd0e964d352b5825861065b3a583860cceb08b56cb72a4e89e6ee33bd7b3ef&w=1380',
}


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  Constants = Constants;
  treinos: any;
  navigate(path: string, params?: any) {
    this.router.navigate([path], {
      queryParams: {
        userId: this.user.id,
        ...params,
      },
    });
  }
  user!: IUsuario | ITeamMember | any;
  treinoUrlImage: string = MALE_BG_URLS.PERNAS;



  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.auth.getUser;
    // if(this.user.flagAdmin){
    //   this.router.navigate(['/admin']);
    //   // return
    // }
    this.treinos =
      this.user.tipo_usuario == Constants.ALUNO_ID
        ? this.user.ficha_aluno
          ?.filter((f: IUsuario) => f.fl_ativo)[0]
          .treinos?.map((t: any) => {
            let url = '';

            switch (true) {
              case t.treino.grupo_muscular_id == 1:
                console.log('entrou aqi...  PEITO', t);
                url = MALE_BG_URLS.PEITO;
                break;
              case t.treino.grupo_muscular_id == 2 ||
                t.treino.grupo_muscular_id == 3:
                console.log('entrou aqi...  COSTAS', t);
                url = MALE_BG_URLS.COSTAS;
                break;
              case t.treino.grupo_muscular_id == 4 ||
                t.treino.grupo_muscular_id == 5 ||
                t.treino.grupo_muscular_id == 6 ||
                t.treino.grupo_muscular_id == 15:
                console.log('entrou aqi...  BRACOS', t);
                url = MALE_BG_URLS.BRACOS;
                break;
              case t.treino.grupo_muscular_id == 7 ||
                t.treino.grupo_muscular_id == 8 ||
                t.treino.grupo_muscular_id == 10 ||
                t.treino.grupo_muscular_id == 14:
                console.log('entrou aqi...  PERNAS', t);
                url = MALE_BG_URLS.PERNAS;
                break;
              case t.treino.grupo_muscular_id == 9:
                console.log('entrou aqi...  GLUTEOS', t);
                url = MALE_BG_URLS.GLUTEOS;
                break;

              default:
                console.log('entrou aqi...  default', t);

                url = MALE_BG_URLS.ABDOMINAL;
                break;
            }

            const _t: any = {
              ...t,
              banner_img: url,
            };

            return _t;
          })
        : [];
  }


}

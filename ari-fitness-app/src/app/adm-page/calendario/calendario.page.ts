import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { EventoService } from 'src/core/services/evento/evento.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';

export interface Evento {
  tipo_evento?: any;
  id?: number;
  created_at: string;
  criado_por: IUsuario['id'] | number;
  data_inicio: string;
  hora_inicio: string;
  data_fim: string;
  hora_fim: string;
  titulo: string;
  descricao: string;
  fl_ativo: boolean;
  local: string;
  tipo_evento_id: number;
  fl_publico: boolean;
  status_evento_id: number;
  banner: string;
  empresa_id: number;
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
})
export class CalendarioPage implements OnInit {
  scrollToList(arg0: Evento[] | undefined) {
    this.eventList.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
  tiposEventos: any[] = [
    { id: 1, name: 'Treino' },
    { id: 2, name: 'Aula' },
    { id: 3, name: 'Evento' },
    { id: 4, name: 'Palestra' },
    { id: 5, name: 'Curso' },
    { id: 6, name: 'Corrida' },
    { id: 7, name: 'Seminario' },
    { id: 8, name: 'Workshop' },
    { id: 9, name: 'Outros' },
  ];

  daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendar: ({ day: number; events: Evento[] } | null)[][] = [];
  currentDate = new Date();
  month = this.currentDate.getMonth();

  openEventForm: boolean = false;
  selectedDay!: Date | string;
  eventForm!: FormGroup;
  user: any;
  selectedEvent: Evento | null = null;

  @ViewChild('eventList') eventList!: ElementRef;

  auth = inject(AuthService);
  fb = inject(FormBuilder);
  eventoService = inject(EventoService);
  pageSize = inject(PageSizeService);
  isMobile: boolean = false;
  ngOnInit() {
    this.isMobile = this.pageSize.getSize().isMobile;

    this.pageSize.screenSizeChange$.subscribe((size) => {
      this.isMobile = size.isMobile;
    });

    this.user = this.auth.getUser;
    console.log('this.user: ', this.user);
    this.buildFilters();
    this.generateCalendar(this.currentDate.getFullYear(), this.month);
    // this.getEventos(this.filters);
  }

  buildFilters(filters?: Partial<Evento>) {
    this.filters = {
      ...filters,
      empresa_id: this.user?.empresa_id,
      data_inicio: new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        1
      )
        .toISOString()
        .split('T')[0],
      data_fim: new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        0
      )
        .toISOString()
        .split('T')[0],
    };
  }

  events: Evento[] = [];
  getEventos(filters?: Partial<Evento>) {
    filters = {
      ...filters,
      empresa_id: this.user?.empresa_id,
    };

    this.eventoService.getEventos(filters).subscribe((eventos: Evento[]) => {
      console.log('eventos: ', eventos);
      this.events = eventos.map((e: Evento) => {
        return {
          ...e,
          data_inicio: e.data_inicio
            ? new Date(e.data_inicio).toISOString().split('T')[0]
            : '',
          data_fim: e.data_fim
            ? new Date(e.data_fim).toISOString().split('T')[0]
            : '',
          hora_inicio: e.hora_inicio?.slice(0, 5),
          hora_fim: e.hora_fim?.slice(0, 5),
        };
      });

      //coloca os eventos nos dias do calendario
      this.calendar.map(
        (week: ({ day: number; events: Evento[] } | null)[]) => {
          week.map((day: { day: number; events: Evento[] } | null) => {
            if (day) day.events = [];

            this.events.forEach((e: Evento) => {
              const eventDay = new Date(
                e.data_inicio
                  .split('-')
                  .map((d: string) => parseInt(d))
                  .join(',')
              ).getDate();
              // console.log('eventDay: ', eventDay);

              if (day?.day === eventDay) {
                // console.log('eventDay: ', eventDay);
                // console.log('evento: ', e);
                day?.events.push(e);
              }

              return day;
            });
            return week;
          });
        }
      );

      // this.calendar.map((week: ({ day: number; events: Evento[] } | null)[]) => {
      //   week.map( (day: { day: number; events: Evento[] } | null) => {
      //     if (day) {
      //       this.events.forEach((e: Evento) => {
      //         const eventDay = new Date(e.data_inicio).getDate();
      //         if (day?.day === eventDay + 1) {
      //           day.events.push(e);
      //         }
      //       });
      //       return day
      //     }
      //     return day
      //   });
      //   return week
      // })
    });
  }

  filters: Partial<Evento> = {
    fl_ativo: true,
  };
  onSaveButtonClick() {
    console.log(this.eventForm.value);
    this.eventoService.saveEvento(this.eventForm.value).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.eventForm.reset();
        this.openEventForm = false;
        this.getEventos(this.filters);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  completeForm(event: Evento) {
    this.createForm(event);
    this.openEventForm = true;
  }

  onBannerChange($event: Event) {
    const reader = new FileReader();
    reader.onload = () => {
      this.eventForm.get('banner')?.setValue(reader.result);
    };

    reader.readAsDataURL((<HTMLInputElement>$event.target).files![0]);
  }

  onFormChange($event: Event) {
    console.log('this.eventForm: ', this.eventForm);
  }

  selectDay(day?: number | null) {
    if (!day) return;

    this.selectedDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0];

    console.log('day: ', this.selectedDay);
    this.createForm();
    this.openEventForm = !this.openEventForm;
  }

  createForm(event?: Evento) {
    this.eventForm = this.fb.group({
      id: [event?.id || null, [Validators.nullValidator]],
      created_at: [
        event?.created_at || new Date().toISOString().split('T')[0],
        [Validators.nullValidator],
      ],
      criado_por: [
        (event?.criado_por || this.user).id,
        [Validators.nullValidator],
      ],
      local: [event?.local || null, [Validators.nullValidator]],
      data_inicio: [
        event?.data_inicio ||
        new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth(),
          Number(this.selectedDay.toString().split('-')[2])
        )
          .toISOString()
          .split('T')[0],
        [Validators.required],
      ],
      hora_inicio: [event?.hora_inicio || null, [Validators.nullValidator]],
      data_fim: [event?.data_fim || null, [Validators.nullValidator]],
      hora_fim: [event?.hora_fim || null, [Validators.nullValidator]],
      titulo: [event?.titulo || null, [Validators.required]],
      descricao: [event?.descricao || null, [Validators.nullValidator]],
      fl_ativo: [event?.fl_ativo || true, [Validators.required]],
      tipo_evento_id: [event?.tipo_evento_id || null, [Validators.required]], // 1 - treino, 2 - aula, 3 - evento, 4 - palestra, 5 - curso, 6 - corrida, 7 - seminario, 8 - workshop, 9 - outros
      fl_publico: [event?.fl_publico || true, [Validators.required]], // 0 - privado, 1 - publico
      status_evento_id: [event?.status_evento_id || 1, [Validators.required]], // 1 - agendado, 2 - realizado, 3 - cancelado
      banner: [event?.banner || null, [Validators.nullValidator]],
      empresa_id: [this.user?.empresa_id, [Validators.nullValidator]],
    });
  }

  generateCalendar(year: number, month: number) {
    this.calendar = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let day = 1;
    //maximo de semanas em um mês
    for (let i = 0; i < 6; i++) {
      const week: ({ day: number; events: Evento[] } | null)[] = [];
      //maximo de dias em uma semana
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (day <= daysInMonth) {
          week.push({
            day: day,
            events: [],
          });
          day++;
        } else {
          week.push(null);
        }
      }
      this.calendar.push(week);
      if (day > daysInMonth) break; // Otimização: interrompe o loop se o mês acabar
    }

    this.getEventos({
      empresa_id: this.user?.empresa_id,
      data_inicio: new Date(year, month, 1).toISOString().split('T')[0],
      data_fim: new Date(year, month + 1, 0).toISOString().split('T')[0],
    });
  }

  goToPreviousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth()
    );
  }

  goToNextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth()
    );
  }
}

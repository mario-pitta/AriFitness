import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckboxChangeEventDetail } from '@ionic/angular';
import { IonCheckboxCustomEvent } from '@ionic/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

import { IUsuario, Usuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { TarefasService } from 'src/core/services/tarefas/tarefas.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

export interface TarefaStatus {
  id: number;
  title: string;
  color: string;
}
export interface Tarefa {
  posicao: any;
  titulo: string;
  descricao: string;
  status: TarefaStatus;
  prioridade: number;
  data_limite_conclusao: Date | string;
  id?: number;
  created_at: Date | string;
  criado_por: number;
  status_tarefa_id: number;
  tipo_tarefa_id: number;
}

@Component({
  selector: 'app-planejador',
  templateUrl: './planejador.page.html',
  styleUrls: ['./planejador.page.scss'],
})
export class PlanejadorPage implements OnInit, OnDestroy {
  prazoChange($event: IonCheckboxCustomEvent<CheckboxChangeEventDetail<any>>) {
    if (!$event.detail.checked) {
      this.taskForm.get('data_limite_conclusao')?.setValue(null);
    }
  }
  showTaskForm: boolean = false;
  cols: { title: string; visible: boolean; tasks: Tarefa[]; status_tarefa_id: number }[] = [];

  user: IUsuario | null = null;

  taskForm!: FormGroup;

  tiposTarefa: { id: number; descricao: string }[] = [];
  constructor(
    private tarefaService: TarefasService,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }
  @ViewChild('prazo') prazo!: any;
  sub$: Subscription = new Subscription();
  ngOnInit() {
    this.user = this.authService.getUser;
    this.loadTiposTarefa();
    this.loadTasks();
    this.createForm();
  }

  drop(event: CdkDragDrop<Tarefa[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update positions and status for all tasks in the target container
    const targetStatusId = Number(event.container.id.split('_')[1]);

    event.container.data.forEach((task, index) => {
      const newPos = index + 1;
      if (task.posicao !== newPos || task.status_tarefa_id !== targetStatusId) {
        task.posicao = newPos;
        task.status_tarefa_id = targetStatusId;
        this.updateTaskStatus(task.id!, targetStatusId, newPos);
      }
    });

    // If moved between containers, also update positions in the source container
    if (event.previousContainer !== event.container) {
      event.previousContainer.data.forEach((task, index) => {
        const newPos = index + 1;
        if (task.posicao !== newPos) {
          task.posicao = newPos;
          this.updateTaskStatus(task.id!, task.status_tarefa_id, newPos);
        }
      });
    }

    // Refresh tasks after a short delay to ensure backend is updated
    setTimeout(() => {
      this.loadTasks();
    }, 500);
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  loadTiposTarefa() {
    this.tarefaService.getTiposTarefa().subscribe((res: any) => {
      this.tiposTarefa = res;
    });
  }

  getNumberOfTasksByStatus(status: number) {
    return this.cols.find((c) => c.status_tarefa_id == status)?.tasks.length;
  }

  createForm(status: number = 1, task?: Tarefa) {
    this.taskForm = this.fb.group({
      id: [task?.id || null, [Validators.nullValidator]],
      titulo: [task?.titulo || null, [Validators.required]],
      descricao: [task?.descricao || '', [Validators.nullValidator]],
      data_limite_conclusao: [
        task?.data_limite_conclusao || null,
        [Validators.nullValidator],
      ],
      prioridade: [task?.prioridade || 0, [Validators.nullValidator]],
      tipo_tarefa_id: [task?.tipo_tarefa_id || 3, [Validators.nullValidator]],
      criado_por: [task?.criado_por || this.user?.id, [Validators.required]],
      status_tarefa_id: [
        task?.status_tarefa_id || status,
        [Validators.nullValidator],
      ],
      posicao: [
        task?.posicao || this.getNumberOfTasksByStatus(status),
        [Validators.nullValidator],
      ],
      empresa_id: [this.user?.empresa_id, [Validators.nullValidator]],
    });

    setTimeout(() => {
      console.log('this.prazo: ', this.prazo);
      if (task?.data_limite_conclusao) {
        this.prazo.el.value = true;
      }
    }, 850);
  }

  updateTaskStatus(taskId: number, status: number, posicao: number = 0) {
    this.tarefaService
      .updateStatus(taskId, status, posicao)
      .subscribe((res) => { });
  }

  log(v: any) {
    console.log('logging: ', v);
  }
  loadTasks() {
    this.tarefaService
      .getByFilters({ fl_ativo: true, empresa_id: this.user?.empresa_id })
      .subscribe((res) => {
        this.cols = [
          {
            title: 'A Fazer',
            visible: true,
            tasks: res
              .filter((t: Tarefa) => t.status_tarefa_id == 1)
              .sort((a, b) => a.posicao - b.posicao),
            status_tarefa_id: 1,
          },
          {
            title: 'Fazendo',
            visible: true,
            tasks: res
              .filter((t: Tarefa) => t.status_tarefa_id == 2)
              .sort((a, b) => a.posicao - b.posicao),
            status_tarefa_id: 2,
          },
          {
            title: 'Feito',
            visible: true,
            tasks: res
              .filter((t: Tarefa) => t.status_tarefa_id == 3)
              .sort((a, b) => a.posicao - b.posicao),
            status_tarefa_id: 3,
          },
        ];
      });

    console.log('this.cols: ', this.cols);
  }

  get f() {
    return this.taskForm;
  }

  saveTask() {
    const tarefa = this.taskForm.value as unknown as Tarefa;
    console.log('tarefa: ', tarefa);

    if (!tarefa.id) delete tarefa.id;

    const req = !tarefa.id
      ? this.tarefaService.create(tarefa)
      : this.tarefaService.update(tarefa);
    req.subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.loadTasks();
        this.showTaskForm = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        // this.toastr.error(err.message);
      },
    });
  }
}

import { PagetitleService } from 'src/core/services/pagetitle.service';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Exercicio } from 'src/core/models/Exercicio';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-exercicios',
  templateUrl: './exercicios.page.html',
  styleUrls: ['./exercicios.page.scss'],
})
export class ExerciciosPage implements OnInit {
  searchText: string = '';
  loading: boolean = false;
  exercicios: Exercicio[] = [];

  constructor(
    private exercicioService: ExercicioService,
    private router: Router,
    private aRoute: ActivatedRoute

  ) { }

  ngOnInit() {
    const queryParams = this.aRoute.snapshot.queryParams;
    console.log('queryParams: ', queryParams);

    this.getExercicios(queryParams);
  }

  getExercicios(filters?: Partial<Exercicio> | Exercicio) {
    this.loading = true;
    filters = { ...filters, fl_ativo: true };

    this.exercicioService.find({ ...filters }).subscribe({
      next: (ex) => (this.exercicios = ex),
      complete: () => (this.loading = false),
    });
  }


  delete(arg0: any) {
    throw new Error('Method not implemented.');
  }
  navigate(id: number) {
    this.router.navigate(['admin/exercicios/form'], {
      queryParams: {
        exId: id,
      },
    });
  }


  filterItems() {

  }

  ngOnDestroy(): void {
    console.log('destruindo exercicios...');
  }
}

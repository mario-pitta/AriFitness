
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Treino } from 'src/core/models/Treino';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { WorkoutExportService } from 'src/core/services/workout-export/workout-export.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { IEmpresa } from 'src/core/models/Empresa';
import { IUsuario } from 'src/core/models/Usuario';
import { EmpresaStateService } from 'src/core/services/empresa/state/empresa-state.service';

@Component({
    selector: 'app-workout-preview-modal',
    templateUrl: './workout-preview-modal.component.html',
    styleUrls: ['./workout-preview-modal.component.scss']
})
export class WorkoutPreviewModalComponent implements OnInit {
    @Input() treinoId!: number;
    treino: Treino | null = null;
    @Input() aluno: IUsuario | null = null;
    empresa: IEmpresa | null = null;
    loading: boolean = true;

    constructor(
        private modalController: ModalController,
        private treinoService: TreinoService,
        private exportService: WorkoutExportService,
        private authService: AuthService,
        private empresaState: EmpresaStateService
    ) { }

    ngOnInit() {
        this.treinoService.getTreinoCompleto(this.treinoId).subscribe(
            {
                next: (res: any) => {
                    this.treino = res.data;
                    this.loading = false;
                    this.empresa = this.empresaState.getEmpresaValue;
                    console.log(' this.treino = ', this.treino)
                },
                error: err => {
                    console.error(err)
                }

            },
        );
    }



    exportPDF() {
        if (this.treino) {
            const instructor = this.authService.getUser as unknown as IUsuario;
            this.exportService.exportToPDF(this.treino, this.aluno as unknown as IUsuario, this.empresa, instructor);
        }
    }

    exportExcel() {
        if (this.treino) {
            this.exportService.exportToExcel(this.treino);
        }
    }

    printThermal() {
        if (this.treino) {
            const instructor = this.authService.getUser as unknown as IUsuario;
            this.exportService.printThermal(this.treino, this.aluno as unknown as IUsuario, this.empresa, instructor);
        }
    }

    confirm() {
        this.modalController.dismiss(true);
    }

    dismiss() {
        this.modalController.dismiss(false);
    }
}

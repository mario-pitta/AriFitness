
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Treino } from 'src/core/models/Treino';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { WorkoutExportService } from 'src/core/services/workout-export/workout-export.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { EmpresaService } from 'src/core/services/empresa/empresa.service';
import { IEmpresa } from 'src/core/models/Empresa';
import { IUsuario } from 'src/core/models/Usuario';

@Component({
    selector: 'app-workout-preview-modal',
    templateUrl: './workout-preview-modal.component.html',
    styleUrls: ['./workout-preview-modal.component.scss']
})
export class WorkoutPreviewModalComponent implements OnInit {
    @Input() treinoId!: number;
    treino: Treino | null = null;
    aluno: IUsuario | null = null;
    empresa: IEmpresa | null = null;
    loading: boolean = true;

    constructor(
        private modalController: ModalController,
        private treinoService: TreinoService,
        private exportService: WorkoutExportService,
        private authService: AuthService,
        private empresaService: EmpresaService
    ) { }

    ngOnInit() {
        this.treinoService.getTreinoCompleto(this.treinoId).subscribe(
            {
                next: (res: any) => {
                    this.treino = res.data;
                    this.loading = false;
                    this.loadEmpresa();
                    console.log(' this.treino = ', this.treino)
                },
                error: err => {
                    console.error(err)
                }

            },
        );
    }

    loadEmpresa() {
        const user = this.authService.getUser;
        if (user && user.empresa_id) {
            this.empresaService.getEmpresa(user.empresa_id).subscribe({
                next: (res: any) => {
                    this.empresa = res.data;
                }
            });
        }
    }

    exportPDF() {
        if (this.treino) {
            this.exportService.exportToPDF(this.treino, this.aluno as unknown as IUsuario, this.empresa);
        }
    }

    exportExcel() {
        if (this.treino) {
            this.exportService.exportToExcel(this.treino);
        }
    }

    printThermal() {
        if (this.treino) {
            this.exportService.printThermal(this.treino, this.empresa);
        }
    }

    confirm() {
        this.modalController.dismiss(true);
    }

    dismiss() {
        this.modalController.dismiss(false);
    }
}

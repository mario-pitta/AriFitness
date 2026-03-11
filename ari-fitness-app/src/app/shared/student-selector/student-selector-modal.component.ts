import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { FichaAlunoService } from 'src/core/services/ficha-aluno/ficha-aluno.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { IUsuario } from 'src/core/models/Usuario';
import { forkJoin } from 'rxjs';
import Constants from 'src/core/Constants';

@Component({
    selector: 'app-student-selector-modal',
    templateUrl: './student-selector-modal.component.html',
    styleUrls: ['./student-selector-modal.component.scss'],
})
export class StudentSelectorModalComponent implements OnInit {
    loading = true;
    searchTerm = '';
    students: any[] = [];
    filteredStudents: any[] = [];
    currentUser: IUsuario;

    constructor(
        private modalCtrl: ModalController,
        private usuarioService: UsuarioService,
        private fichaService: FichaAlunoService,
        private auth: AuthService
    ) {
        this.currentUser = this.auth.getUser;
    }

    ngOnInit() {
        this.loadStudents();
    }

    loadStudents() {
        this.loading = true;
        // Fetch students for the same company
        this.usuarioService.findByFilters({
            tipo_usuario: Constants.ALUNO_ID, // ALUNO
            empresa_id: this.currentUser.empresa_id
        }).subscribe({
            next: (students: any[]) => {
                const fichaRequests = students.map(s =>
                    this.fichaService.getByUser(s.id, { fl_ativo: true })
                );

                if (fichaRequests.length === 0) {
                    this.loading = false;
                    return;
                }

                forkJoin(fichaRequests).subscribe({
                    next: (fichasArray: any[]) => {
                        this.students = students.map((s, index) => ({
                            ...s,
                            fichas: fichasArray,
                            ficha_ativa: fichasArray[index][0] || null
                        })).filter(s => s.ficha_ativa); // Only show students with active fichas to clone

                        this.filteredStudents = [...this.students];
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    }
                });
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    filterStudents() {
        if (!this.searchTerm.trim()) {
            this.filteredStudents = [...this.students];
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredStudents = this.students.filter(s =>
            s.nome.toLowerCase().includes(term) ||
            (s.ficha_ativa?.descricao?.toLowerCase().includes(term))
        );
    }

    selectStudent(student: any) {
        this.modalCtrl.dismiss(student.ficha_ativa);
    }

    dismiss() {
        this.modalCtrl.dismiss();
    }
}

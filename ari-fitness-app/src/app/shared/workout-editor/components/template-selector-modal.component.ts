import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { Treino } from 'src/core/models/Treino';
import { AuthService } from 'src/core/services/auth/auth.service';

@Component({
    selector: 'app-template-selector-modal',
    templateUrl: './template-selector-modal.component.html',
    styleUrls: ['./template-selector-modal.component.scss'],
})
export class TemplateSelectorModalComponent implements OnInit {
    allTemplates: any[] | Treino[] = [];
    filteredTemplates: any[] | Treino[] = [];
    searchTerm: string = '';
    selectedLevel: number = -1; // -1 for "All"
    loading: boolean = true;

    constructor(
        private modalController: ModalController,
        private treinoService: TreinoService,
        private auth: AuthService
    ) { }

    ngOnInit() {
        this.loadTemplates();
    }

    loadTemplates() {
        this.loading = true;
        const user = this.auth.getUser;

        // Fetch public templates and company templates
        this.treinoService.find({ empresa_id: this.auth.getUser.empresa_id, fl_publico: true } as any).subscribe({
            next: (publicTemplates: Treino[]) => {
                this.allTemplates = publicTemplates.map(template => {
                    return {
                        ...template,
                        label: this.getLevelLabel(template.nivel_dificuldade),
                        color: this.getLevelColor(template.nivel_dificuldade),
                        class: this.getLevelClass(template.nivel_dificuldade)
                    }
                });
                this.filterTemplates();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    filterTemplates() {
        this.filteredTemplates = this.allTemplates.filter(t => {
            const matchesSearch = !this.searchTerm ||
                t.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                t.descricao?.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesLevel = this.selectedLevel === -1 || t.nivel_dificuldade === this.selectedLevel;

            return matchesSearch && matchesLevel;
        });
    }

    setLevel(level: number) {
        this.selectedLevel = level;
        this.filterTemplates();
    }

    getLevelLabel(level: number): string {
        switch (level) {
            case 1: return 'Iniciante';
            case 2: return 'Intermediário';
            case 3: return 'Avançado';
            default: return 'Geral';
        }
    }

    getLevelColor(level: number): string {
        switch (level) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'danger';
            default: return 'primary';
        }
    }

    getLevelClass(level: number): string {
        return `level-${level || 0}`;
    }

    dismiss() {
        this.modalController.dismiss();
    }

    selectTemplate(template: Treino) {
        this.modalController.dismiss(template);
    }
}

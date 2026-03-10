
import { Component, Input, OnInit } from '@angular/core';
import { FichaSessao } from 'src/core/models/FichaSessao';

@Component({
    selector: 'app-student-session-view',
    templateUrl: './student-session-view.component.html',
    styleUrls: ['./student-session-view.component.scss']
})
export class StudentSessionViewComponent implements OnInit {
    @Input() sessoes: FichaSessao[] = [];
    activeSession: FichaSessao | null = null;

    constructor() { }

    ngOnInit() {
        if (this.sessoes.length > 0) {
            this.activeSession = this.sessoes[0];
        }
    }

    selectSession(sessao: FichaSessao) {
        this.activeSession = sessao;
    }
}

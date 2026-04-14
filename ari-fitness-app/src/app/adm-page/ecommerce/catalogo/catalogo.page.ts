import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

@Component({
  selector: 'app-catalogo-page',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss']
})
export class CatalogoPage implements OnInit {
  empresaId: string | null = null;
  catalogoUrl = '';

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const user = this.authService.getUser;
    if (user?.empresa_id) {
      this.empresaId = user.empresa_id;
      this.catalogoUrl = `${environment.publicUrl}/catalogo/${this.empresaId}`;
    }
  }

  async copiarLink() {
    try {
      await navigator.clipboard.writeText(this.catalogoUrl);
      this.toastr.success('Link copiado!');
    } catch {
      this.toastr.error('Erro ao copiar');
    }
  }

  abrirCatalogo() {
    window.open(this.catalogoUrl, '_blank');
  }
}
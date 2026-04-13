import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { environment } from 'src/environments/environment';

interface Produto {
  id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  ativo: boolean;
  categoria?: string;
}

@Component({
  selector: 'app-produtos-page',
  templateUrl: './produtos-page.page.html',
  styleUrls: ['./produtos-page.page.scss'],
})
export class ProdutosPagePage implements OnInit {
  produtos: Produto[] = [];
  loading = true;
  editingProduto: Produto | null = null;
  showForm = false;
  categorias: string[] = [];
  
  formData: Partial<Produto> = {
    nome: '',
    descricao: '',
    preco: 0,
    estoque: 0,
    estoque_minimo: 5,
    imagem_url: '',
    ativo: true,
    categoria: ''
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private toastr: ToastrService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadProdutos();
    this.loadCategorias();
  }

  get empresaId(): string {
    return this.auth.getUser?.empresa_id || '';
  }

  loadProdutos() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}`).subscribe({
      next: (res) => {
        this.produtos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Erro ao carregar produtos');
      }
    });
  }

  loadCategorias() {
    this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}/lista/categorias`).subscribe({
      next: (res) => {
        this.categorias = res.data || [];
      }
    });
  }

  openForm(produto?: Produto) {
    if (produto) {
      this.editingProduto = produto;
      this.formData = { ...produto };
    } else {
      this.editingProduto = null;
      this.formData = {
        nome: '',
        descricao: '',
        preco: 0,
        estoque: 0,
        estoque_minimo: 5,
        imagem_url: '',
        ativo: true,
        categoria: ''
      };
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingProduto = null;
  }

  saveProduto() {
    if (!this.formData.nome || !this.formData.preco) {
      this.toastr.error('Nome e preço são obrigatórios');
      return;
    }

    const payload = {
      ...this.formData,
      preco: Number(this.formData.preco),
      estoque: Number(this.formData.estoque)
    };

    if (this.editingProduto?.id) {
      this.http.put<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${this.editingProduto.id}`, payload).subscribe({
        next: () => {
          this.toastr.success('Produto atualizado!');
          this.loadProdutos();
          this.closeForm();
        },
        error: () => this.toastr.error('Erro ao atualizar')
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/produtos/${this.empresaId}`, payload).subscribe({
        next: () => {
          this.toastr.success('Produto criado!');
          this.loadProdutos();
          this.closeForm();
        },
        error: () => this.toastr.error('Erro ao criar')
      });
    }
  }

  async toggleAtivo(produto: Produto) {
    const action = produto.ativo ? 'desativar' : 'ativar';
    const alert = await this.alertController.create({
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} produto`,
      message: `Deseja ${action} o produto "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.http.put<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${produto.id}`, { ativo: !produto.ativo }).subscribe({
              next: () => {
                this.toastr.success(`Produto ${action}!`);
                this.loadProdutos();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteProduto(produto: Produto) {
    const alert = await this.alertController.create({
      header: 'Excluir produto',
      message: `Deseja excluir "${produto.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          cssClass: 'alert-button-destructive',
          handler: () => {
            this.http.delete<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${produto.id}`).subscribe({
              next: () => {
                this.toastr.success('Produto excluído!');
                this.loadProdutos();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getEstoqueClass(estoque: number, minimo: number = 5): string {
    if (estoque === 0) return 'estoque-zero';
    if (estoque <= minimo) return 'estoque-baixo';
    return 'estoque-ok';
  }
}
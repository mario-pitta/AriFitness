import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import { MaskitoDirective } from '@maskito/angular';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { PedidoService } from 'src/core/services/ecommerce/pedido.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { Empresa } from 'src/core/models/Empresa';
import { ItemCarrinho } from 'src/core/models/Carrinho';
import Constants from 'src/core/Constants';

// Validator de CPF
function cpfValidator(control: AbstractControl) {
  const value = control.value as string;
  if (!value) return { cpfInvalido: true };

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return { cpfInvalido: true };
  if (/^(\d)\1{10}$/.test(digits)) return { cpfInvalido: true };

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let d1 = sum % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  if (parseInt(digits[9]) !== d1) return { cpfInvalido: true };

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  let d2 = sum % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  return parseInt(digits[10]) !== d2 ? { cpfInvalido: true } : null;
}

// Validator de telefone
function telefoneValidator(control: AbstractControl) {
  const value = control.value as string;
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11 ? null : { telefoneInvalido: true };
}

@Component({
  selector: 'app-carrinho-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, MaskitoDirective],
  templateUrl: './carrinho-modal.html',
  styleUrls: ['./carrinho-modal.scss']
})
export class CarrinhoModalComponent implements OnInit {
  @Input() empresaId: string | null = null;
  @Input() empresa: Empresa | null = null;

  itens: ItemCarrinho[] = [];
  form!: FormGroup;
  loading = false;

  cpfMask: MaskitoOptions = Constants.cpfMask;
  telefoneMask: MaskitoOptions = Constants.phoneMask;
  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as unknown as HTMLIonInputElement).getInputElement();

  get total(): number {
    return this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  }

  get podeFinalizar(): boolean {
    return this.form.valid && this.itens.length > 0 && !this.loading;
  }

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.itens = this.carrinhoService.getAll();

    const dadosSalvos = this.carrinhoService.getDadosCliente();

    this.form = this.fb.group({
      nome: [dadosSalvos?.nome || '', [Validators.required, Validators.minLength(3)]],
      cpf: [dadosSalvos?.cpf || '', [Validators.required, cpfValidator]],
      telefone: [dadosSalvos?.telefone || '', [Validators.required, telefoneValidator]],
      email: [dadosSalvos?.email || '', [Validators.email]],
      observacoes: [dadosSalvos?.observacoes || '', [Validators.maxLength(500)]],
    });
  }

  incrementar(item: ItemCarrinho) {
    if (!this.carrinhoService.canIncrement(item)) {
      this.toastr.warning(`Quantidade máxima em estoque para "${item.nome}": ${item.estoque}`);
      return;
    }
    this.carrinhoService.updateQuantity(item.produto_id, item.quantidade + 1);
    this.itens = this.carrinhoService.getAll();
  }

  decrementar(item: ItemCarrinho) {
    if (item.quantidade > 1) {
      this.carrinhoService.updateQuantity(item.produto_id, item.quantidade - 1);
      this.itens = this.carrinhoService.getAll();
    }
  }

  remover(produtoId: string) {
    this.carrinhoService.removeItem(produtoId);
    this.itens = this.carrinhoService.getAll();
  }

  limparCarrinho() {
    this.carrinhoService.clear();
    this.itens = [];
  }

  finalizarPedido() {
    if (!this.empresa?.id || !this.podeFinalizar) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { nome, cpf, telefone, email, observacoes } = this.form.value;

    this.carrinhoService.setDadosCliente({ nome, cpf, telefone, email, observacoes });

    const valorTotal = this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    const pedido = {
      cliente_nome: nome,
      cliente_telefone: telefone,
      cliente_email: email || null,
      cliente_obs: observacoes || null,
      valor_total: valorTotal,
      status: 'pendente',
      itens: this.itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      })),
      empresa_id: this.empresa.id,
    };

    this.loading = true;
    this.pedidoService.create(pedido).subscribe({
      next: () => {
        this.toastr.success('Pedido realizado com sucesso! Em breve entraremos em contato. 🛍️');
        this.carrinhoService.clear();
        this.loading = false;
        this.close();
      },
      error: (err) => {
        this.loading = false;
        const mensagem = this.extrairMensagemErro(err);
        this.toastr.error(mensagem);
      }
    });
  }

  // Helpers para template
  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(field: string): string {

    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'Campo obrigatório';
    if (ctrl.errors['minlength']) return `Mínimo ${ctrl.errors['minlength'].requiredLength} caracteres`;
    if (ctrl.errors['email']) return 'Email inválido';
    if (ctrl.errors['cpfInvalido']) return 'CPF inválido';
    if (ctrl.errors['telefoneInvalido']) return 'Telefone inválido';
    if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }

  // Extrai mensagem de erro amigável da resposta da API
  private extrairMensagemErro(err: any): string {
    // NestJS retorna o erro no campo err.error
    const backendMsg: string =
      err?.error?.message ||
      err?.error?.error?.message ||
      err?.message ||
      '';

    if (!backendMsg) return 'Erro ao criar pedido. Tente novamente.';

    // Mapeia mensagens técnicas do backend para mensagens amigáveis
    if (backendMsg.includes('Estoque insuficiente')) {
      return '⚠️ Estoque insuficiente para um ou mais produtos do seu carrinho. Verifique as quantidades e tente novamente.';
    }
    if (backendMsg.includes('não encontrado') || backendMsg.includes('not found')) {
      return '⚠️ Um dos produtos do carrinho não está mais disponível.';
    }
    if (backendMsg.includes('ativo') || backendMsg.includes('inactive')) {
      return '⚠️ Um dos produtos foi desativado. Remova-o do carrinho para continuar.';
    }

    return `Erro ao criar pedido: ${backendMsg}`;
  }

  close() {
    this.modalController.dismiss();
  }
}

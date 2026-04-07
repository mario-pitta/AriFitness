import { ToastrService } from 'src/core/services/toastr/toastr.service';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Constants from 'src/core/Constants';
import {
  TransacaoFinanceira,
  TransacaoFinanceiraForm,
} from 'src/core/models/TransacaoFInanceira';
import { ConfettiService } from 'src/core/services/confetti/confetti.service';
import { TransacaoFinanceiraService } from 'src/core/services/transacao-financeira/transacao-financeira.service';
import { FormaDePagamento } from 'src/core/models/TransacaoFInanceira';
import { IUsuario } from 'src/core/models/Usuario';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ModalController, SelectChangeEventDetail } from '@ionic/angular';
import { IonSelectCustomEvent } from '@ionic/core';
import { ReciboService } from 'src/core/services/recibo/recibo.service';
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-form-transacao-finaceira',
  templateUrl: './form-transacao-finaceira.component.html',
  styleUrls: ['./form-transacao-finaceira.component.scss'],
})
export class FormTransacaoFinaceiraComponent implements OnInit, OnDestroy {
  closeModal() {
    this.modalController.dismiss();
  }
  @Input() transacaoFinanceira!: TransacaoFinanceira | undefined;
  @Input() tipoTransacaoId: number = 1;
  @Input() categoriaTransacaoId!: number;
  @Input() selectedMembro!: IUsuario | any;
  @Input() selectedUsuario: any;
  @Input() servicoId!: number;
  @Input() action: string = 'nova';
  @Input() tipo: string = 'receita';

  @Output() output: EventEmitter<any> = new EventEmitter();
  response: Subject<any> = new Subject<any>();

  transacaoForm = new TransacaoFinanceiraForm() as unknown as FormGroup;

  showReciboModal: boolean = false;
  categorias: CategoriaFinanceira[] = [];
  tipos: TipoTransacaoFinanceira[] = [];
  membros: IUsuario[] = [];
  formasPagamento: string[] = [];
  discountType: '%' | 'R$' = '%';
  user!: IUsuario;
  auth = inject(AuthService);
  usuarioService = inject(UsuarioService);

  confetti = inject(ConfettiService);
  meses = Constants.meses;
  anos: {
    value: number;
  }[] = new Array(5)
    .fill(0)
    .map((i, index) => ({ value: new Date().getFullYear() - index }));

  public get f() {
    return this.transacaoForm as FormGroup;
  }

  constructor(
    private transFinancService: TransacaoFinanceiraService,
    private modalController: ModalController
  ) { }
  async ngOnInit() {
    this.user = this.auth.getUser;

    await this.getMembros();
    this.getTiposTransacaoFinanceira();
    this.getCategoriasByTipoId(this.tipoTransacaoId);
    this.calculaValorFinal();

    setTimeout(() => {
      this.buildForm(this.transacaoFinanceira);
      this.upgradeForm();
      this.buildValidators(this.categoriaTransacaoId);
    }, 250);

    Object.keys(FormaDePagamento).forEach((key: string) => {
      this.formasPagamento.push(key);
    });
  }

  upgradeForm() {
    console.log('inputs: ', {
      transacaoFinanceira: this.transacaoFinanceira,
      tipoTransacaoId: this.tipoTransacaoId,
      categoriaTransacaoId: this.categoriaTransacaoId,
      selectedMembro: this.selectedMembro,
      selectedUsuario: this.selectedUsuario,
      servicoId: this.servicoId,
      action: this.action,
      tipo: this.tipo,
    });
    if (this.transacaoFinanceira) {
      let descricao = this.transacaoFinanceira.descricao || '';
      this.categoriaTransacaoId = Number(
        this.transacaoFinanceira.tr_categoria_id
      );
      this.tipoTransacaoId = Number(this.transacaoFinanceira.tr_tipo_id);
      this.servicoId = Number(this.transacaoFinanceira.servico_id);
    }

    this.transacaoForm.controls['tr_tipo_id'].setValue(this.tipoTransacaoId);
    this.transacaoForm.controls['tr_categoria_id'].setValue(
      this.categoriaTransacaoId || null
    );
    this.transacaoForm.controls['servico_id'].setValue(this.servicoId || null);
    this.transacaoForm.setControl(
      'desconto',
      new FormControl(
        this.transacaoFinanceira?.desconto_perc ||
        this.transacaoFinanceira?.desconto_real ||
        0,
        [Validators.nullValidator]
      )
    );

    if (this.selectedMembro) {
      console.log('this.selectedMembro: ', this.selectedMembro);

      this.transacaoForm.controls['pago_por'].setValue(this.selectedMembro.id);
      this.transacaoForm.controls['valor_real'].setValue(
        this.selectedMembro.planos.preco_padrao
      );
      this.transacaoForm.controls['valor_final'].setValue(
        this.selectedMembro.planos.preco_padrao
      );
    }

    this.getCategoriasByTipoId(this.f.value.tr_tipo_id);

    console.log('this.transacaoForm: ', this.transacaoForm);

  }

  buildForm(transacao?: Partial<TransacaoFinanceira>) {
    this.transacaoForm.patchValue({
      id: transacao?.id || null,
      descricao: transacao?.descricao || null,
      valor_real: transacao?.valor_real || null,
      desconto: transacao?.desconto_perc || transacao?.desconto_real || 0,
      forma_pagamento: transacao?.forma_pagamento || null,
      pago_por: transacao?.pago_por || null,
      data_lancamento:
        transacao?.data_lancamento || new Date().toISOString().split('T')[0],
      mes: transacao?.mes || null,
      ano: transacao?.ano || null,
      tr_categoria_id: transacao?.tr_categoria_id || null,
      tr_tipo_id: transacao?.tr_tipo_id || null,
      servico_id: transacao?.servico_id || null,
      produto_id: transacao?.produto_id || null,
      recebido_por: transacao?.recebido_por || this.user?.id,
      empresa_id: transacao?.empresa_id || this.user?.empresa_id,
      quantidade: transacao?.quantidade || null,
      valor_final: transacao?.valor_final || null,
      comprovante_url: transacao?.comprovante_url || null,
      membro: transacao?.membro || null,
      auth_code: transacao?.auth_code || null,
      fl_pago: transacao?.fl_pago ?? true,
    });

    if (transacao?.pago_por) {
      this.onChangeMembro({
        detail: { value: { id: transacao?.pago_por } },
      } as any);
    }
  }

  onFormChange($event: Event) { }
  onChangeMembro($event: IonSelectCustomEvent<SelectChangeEventDetail<any>>) {
    // valor_real

    this.selectedMembro = this.membros.find(
      (membro) => membro.id === $event.detail.value.id
    );

    this.transacaoForm.controls['valor_real'].setValue(
      this.selectedMembro.planos.preco_padrao
    );
    this.calculaValorFinal();
  }
  getMembros() {
    this.usuarioService
      .findByFilters({
        tipo_usuario: Constants.ALUNO_ID,
        fl_ativo: true,
        empresa_id: this.user?.empresa_id,
      })
      .subscribe({
        next: (res) => {
          this.membros = res;
        },
      });
  }

  onChangeTipo(event: any) {
    this.transacaoForm.controls['tr_categoria_id'].setValue(null);
    this.getCategoriasByTipoId(this.transacaoForm.value.tr_tipo_id);
  }

  getTiposTransacaoFinanceira() {
    return this.transFinancService.getTiposTransacaoFinanceira().subscribe({
      next: (res) => {
        this.tipos = res;
      },
    });
  }

  getCategoriasByTipoId(tipoId: number) {
    return this.transFinancService.getCategoriasByTipoId(tipoId).subscribe({
      next: (res) => {
        this.categorias = res;
      },
    });
  }

  setDiscountType(type: any) {
    this.discountType = type;

    this.calculaValorFinal();
  }

  updateTransacao(arg0: any) {
    this.submit();
  }
  saveTransacao(arg0: any) {
    this.submit();
  }

  submit() {
    if (this.transacaoForm.invalid) {
      this.transacaoForm.markAllAsTouched();
      return;
    }

    let transacao = this.transacaoForm.getRawValue();

    if (transacao.desconto) {
      switch (this.discountType) {
        case '%':
          transacao.desconto_perc = transacao.desconto;
          break;
        case 'R$':
          transacao.desconto_real = transacao.desconto;
          break;
        default:
          break;
      }
    }
    delete transacao.desconto;

    // if(transacao.membro){
    transacao.pago_por = transacao.membro?.id || transacao.pago_por || null;
    // }
    delete transacao.membro;

    if (!transacao.id) {
      delete transacao.id;
    }

    this.transFinancService.save(transacao).subscribe({
      next: (res: any) => {
        this.transacaoForm.get('id')?.setValue(res.id);
        this.transacaoFinanceira = res[0];
        this.calculaValorFinal();
        this.toastr.success('Salvo com sucesso', 'top');
        this.emit(true);
        this.modalController.dismiss(res[0]);
      },
      error: (err) => {
        console.error(err)
        this.toastr.open({
          message: err.error.message,
          duration: 5000,
          position: 'top',
          color: 'danger',
        });
      },
    });
  }

  emit(success: boolean) {
    this.output.emit(success);
    this.response.next(success);
    this.modalController.dismiss({ success });
  }

  toastr = inject(ToastrService);
  onChangeCategoria(
    $event: IonSelectCustomEvent<SelectChangeEventDetail<any>>
  ) {
    this.transacaoForm.get('valor_padrao')?.setValue(0);
    const { value } = $event.detail;
    if (!value) return;

    this.buildValidators(value);
  }

  buildValidators(categoriaId: number) {
    const mes = this.transacaoForm.get('mes');
    const ano = this.transacaoForm.get('ano');

    mes?.removeValidators(Validators.required);
    ano?.removeValidators(Validators.required);

    switch (categoriaId) {
      case 1: // mensalidade
        mes?.addValidators(Validators.required);
        ano?.addValidators(Validators.required);
        break;

      default:
        mes?.updateValueAndValidity();
        ano?.updateValueAndValidity();

        break;
    }
    this.transacaoForm.updateValueAndValidity();
  }

  calculaValorFinal() {
    const discountType = this.discountType;
    const valor_real = this.f.value.valor_real;
    if (discountType === '%') {
      this.transacaoForm
        .get('valor_final')
        ?.setValue(
          valor_real - (Number(valor_real) * this.f.value.desconto) / 100
        );
    } else {
      this.transacaoForm
        .get('valor_final')
        ?.setValue(Number(valor_real) - this.f.value.desconto);
    }
  }

  recibo!: Recibo | null;
  gerarRecibo(recibo: Recibo) {
    this.recibo = recibo;

    const audio = new Audio('../../assets/audios/cash-register.mp3');

    audio.play();
    setTimeout(() => {
      this.confetti.showConfetti();
    }, 250);
  }

  reciboService = inject(ReciboService);
  async buildReciboImage(
    callback: (data: { blob: Blob; base64: string }) => any
  ) {
    this.reciboService.buildRecibo(
      this.transacaoFinanceira as TransacaoFinanceira,
      this.user,
      callback
    );
  }

  //TODO CORRIGIR A COPIA DO RECIBO
  copyReciboImage() {
    this.buildReciboImage((data) => {
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': data['base64'] as string,
        }),
      ]);
    });
  }

  ngOnDestroy() {
    this.transacaoForm.reset();
  }
}

export interface Recibo {
  id: number;
  member: {
    id: number;
    nome: string;
  };
  plano: {
    id: number;
    descricao: string;
    valor: number;
  };
  dataPagamento: string;
  data_lancamento: string;
  mes: number;
  ano: number;
  desconto: number;
  discountType: string;
  valorPago: number;
  formaPagamento: string;
  comprovante: string;
}

export interface CategoriaFinanceira {
  id: number;
  descricao: string;
  tr_tipo_id: number;
  tipo: TipoTransacaoFinanceira;
}

export interface TipoTransacaoFinanceira {
  id: number;
  descricao: string;
}

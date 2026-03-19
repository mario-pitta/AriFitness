import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import Constants from 'src/core/Constants';
import { TransacaoFinanceira } from 'src/core/models/TransacaoFInanceira';
import { Usuario } from 'src/core/models/Usuario';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root',
})
export class ReciboService {
  constructor() { }

  async buildRecibo(
    transacao: TransacaoFinanceira,
    user: Usuario,
    callback: (data: { blob: Blob; base64: string }) => void
  ) {
    const template = await this.buildTemplate(transacao, user).then((t) => t);
    return html2canvas(template).then((canvas) => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      const data = img.src.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(data, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });
      callback({
        blob: blob,
        base64: data,
      });
      template.remove();
    });
  }

  buildTemplateStyle() {
    return `
      .recibo {
        font-family: Arial, sans-serif;
        font-size: 14px;
        margin: 0 auto;
        padding: 20px;
        max-width: 600px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .recibo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .recibo-logo img {
        max-width: 100px;
        max-height: 100px;
      }

      .recibo-title {
        text-align: center;
      }

      .recibo-title h4 {
        font-size: 18px;
        margin: 0;
      }

      .recibo-body {
        margin-bottom: 20px;
      }

      .recibo-info {
        display: flex;
        flex-direction: column;
      }

      .recibo-info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .recibo-info-item-label {
        font-weight: bold;
      }

      .recibo-info-item-value {
        margin-left: 10px;
      }

      .recibo-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .recibo-footer-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }



      .recibo-footer-item-label {
        font-weight: bold;
      }

      .recibo-footer-item-value {
        margin-left: 10px;
      }

      .signature {
        justify-items: center;
      }

      .recibo-signature {
        text-align: center;
        margin-top: 20px;
      }

      .recibo-signature p {
        margin: 0;
        font-weight: bold;
      }

      .text-secondary {
        color: #888;
      }


      .cod-div {
      width: 100%;
        display: flex;
        flex-wrap: wrap-reverse;
        justify-content: between;
        align-items: bottom;
      }
    `;
  }

  async buildTemplate(transacao: TransacaoFinanceira, user: Usuario) {
    console.log('transacao: ', transacao);
    console.log('user: ', user);

    // Format date for the receipt
    const currentDate = new Date(transacao.data_lancamento as string);
    const formattedDate = currentDate.toLocaleDateString('pt-BR');

    // Create receipt template
    const template = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = this.buildTemplateStyle();
    template.appendChild(style);
    const recibo = document.createElement('div');
    recibo.classList.add('recibo');

    // Create receipt structure
    const reciboHeader = document.createElement('div');
    reciboHeader.classList.add('recibo-header');

    const reciboLogo = document.createElement('div');
    reciboLogo.classList.add('recibo-logo');

    const reciboLogoImg = document.createElement('img');
    reciboLogoImg.src =
      user.empresa?.logo_url || 'assets/mvk-gym-manager-logo.png';
    reciboLogo.appendChild(reciboLogoImg);

    const reciboTitle = document.createElement('div');
    reciboTitle.classList.add('recibo-title');
    const title = document.createElement('h2');
    title.textContent = 'Recibo de Pagamento';
    reciboTitle.appendChild(title);

    // Assemble header
    reciboHeader.append(reciboLogo, reciboTitle);

    // Create body
    const reciboBody = document.createElement('div');
    reciboBody.classList.add('recibo-body');

    const reciboInfo = document.createElement('div');
    reciboInfo.classList.add('recibo-info');

    // Add receipt information
    const infoItems = [
      { label: 'Data', value: formattedDate },
      { label: 'Descrição', value: transacao.descricao as string },
      {
        label: 'Motivo',
        value: (transacao.categoria?.descricao as string).toUpperCase(),
      }, //TODO: MUDAR CONFORME NOVAS CATEGORIAS SEJAM ADICIONADAS
    ];

    if (transacao.tr_categoria_id === Constants.TR_CATEGORIA_MENSALIDADE) {
      infoItems.push(
        { label: 'Nome', value: transacao.membro?.nome as string },
        { label: 'Mês/Ano', value: transacao.mes + '/' + transacao.ano }
      );
    }

    infoItems.push({
      label: 'Valor Real',
      value: `R$ ${transacao.valor_real}`,
    });

    if (transacao.desconto_perc || transacao.desconto_real) {
      infoItems.push({
        label: 'Desconto',
        value: `${transacao.desconto_perc
            ? transacao.desconto_perc + '%'
            : transacao.desconto_real
              ? 'R$ ' + transacao.desconto_real
              : ''
          }`,
      });
    }
    // Create info items
    infoItems.forEach((item) => {
      const infoItem = document.createElement('div');
      infoItem.classList.add('recibo-info-item');

      const label = document.createElement('span');
      label.classList.add('recibo-info-item-label');
      label.textContent = item.label + ':';

      const value = document.createElement('span');
      value.classList.add('recibo-info-item-value');
      value.textContent = item.value as string;

      infoItem.append(label, value);
      reciboInfo.appendChild(infoItem);
    });

    reciboBody.appendChild(reciboInfo);

    // Create footer
    const reciboFooter = document.createElement('div');
    reciboFooter.classList.add('recibo-footer');

    const reciboFooterItem = document.createElement('div');
    reciboFooterItem.classList.add('recibo-footer-item');

    const reciboFooterItemLabel = document.createElement('span');
    reciboFooterItemLabel.classList.add('recibo-footer-item-label');
    reciboFooterItemLabel.textContent = 'Total Pago:';

    const reciboFooterItemValue = document.createElement('span');
    reciboFooterItemValue.classList.add('recibo-footer-item-value');
    reciboFooterItemValue.textContent = `R$ ${transacao.valor_final}`;

    reciboFooterItem.appendChild(reciboFooterItemLabel);
    reciboFooterItem.appendChild(reciboFooterItemValue);
    reciboFooter.appendChild(reciboFooterItem);

    const signature = document.createElement('div');
    signature.classList.add('recibo-signature');
    const signatureName = document.createElement('p');
    signatureName.textContent = user.nome;
    signature.appendChild(signatureName);

    const signatureEnterprise = document.createElement('span');
    signatureEnterprise.textContent = user.empresa?.nome_fantasia as string;
    signature.appendChild(signatureEnterprise);

    //build random code
    const authCodeDiv = document.createElement('div');
    authCodeDiv.classList.add('cod-div');
    const authCodeParag = document.createElement('sub');
    authCodeParag.classList.add('text-secondary', 'cod-div');
    authCodeParag.textContent = 'Cód: ' + transacao.auth_code;

    const qrCode = document.createElement('img');
    qrCode.src = await this.buildQrCode(transacao.auth_code as string);
    console.log('qrCode.src: ', qrCode.src);

    authCodeDiv.appendChild(authCodeParag);
    authCodeDiv.appendChild(qrCode);

    // Assemble the receipt
    recibo.appendChild(reciboHeader);
    recibo.appendChild(reciboBody);
    recibo.appendChild(reciboFooter);
    recibo.appendChild(signature);
    recibo.appendChild(authCodeDiv);
    template.appendChild(recibo);

    // Add to document
    document.body.appendChild(template);
    return template;
  }
  buildQrCode(auth_code: string): string {
    return QRCode.toDataURL(
      document.location.origin + '/validate_receipt/' + auth_code,
      {
        width: 100,
      }
    )
      .then((result: string) => {
        return result;
      })
      .catch((err: any) => {
        throw err;
      });
  }
}

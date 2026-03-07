import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AiService } from 'src/core/services/ai/ai.service';
import jsPDF from 'jspdf';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
const htmlToPdfmake = require('html-to-pdfmake');


@Component({
  selector: 'app-analise-ia-modal',
  templateUrl: './analise-ia-modal.component.html',
  styleUrls: ['./analise-ia-modal.component.scss'],
})
export class AnaliseIaModalComponent implements OnInit {
  loading = true;
  data!: {
    empresa_id: string;
    data_inicio: string;
    data_fim: string;
  };

  report: string = '';
  error: string = '';

  constructor(
    private modalController: ModalController,
    private aiService: AiService
  ) { }

  analisys!: {
    report: string;
    data: {
      despesas: number;
      receitas: number;
      problemas: {
        name: string;
        probabilidade: number;
      }[];
      causas: {
        name: string;
        probabilidade: number;
      }[];
      melhorias: {
        name: string;
        probabilidade: number;
      }[];
      fluxoDeCaixa: number;
      chartData: any;
    };
    orientacoes: string;
    html: string;
  }
  // = {
  //   report:
  //     '# Relatório Financeiro MvK Gym\n\n## Visão geral das finanças da academia\n\nA MvK Gym apresenta um cenário financeiro que requer atenção imediata.  Há indícios de problemas na gestão de receitas e algumas inconsistências nos dados fornecidos, que serão detalhadas a seguir.\n\n\n## Cálculo exato de receitas e despesas\n\nApós análise detalhada das transações financeiras, foram identificadas as seguintes receitas e despesas.  É importante ressaltar que a inconsistência em algumas informações (descrições vagas e datas de lançamento conflitantes) dificultaram uma análise mais precisa.\n\n**Receitas:**\n\n* Mensalidades: R$ 2.268,50 (considerando descontos)\n* Diárias: R$ 150\n* Aulas Particulares: R$ 250\n\n**Total de Receitas (com descontos): R$ 2.668,50**\n\n**Despesas:**\n\n* Combustível: R$ 120\n* Reparos: R$ 80\n\n**Total de Despesas: R$ 200**\n\n**Fluxo de Caixa (Receitas - Despesas): R$ 2.468,50**\n\n\n## Listagem dos descontos principais\n\n* **Desconto 1:** Mensalidade de R$ 300,00 reduzida para R$ 150,00 (50% de desconto). Motivo: Não especificado, necessita investigação. Beneficiário: Não especificado, necessita investigação.\n* **Desconto 2:** Mensalidade de R$ 150,00 reduzida para R$ 148,50 (1% de desconto). Motivo: Não especificado, necessita investigação. Beneficiário: Alana.\n\n**Valor Total de Descontos: R$ 151,50**\n\n\n## Identificação de problemas e suas probabilidades\n\n* **Baixa receita média por aluno:** 70%\n* **Gestão ineficiente de descontos:** 20%\n* **Falta de controle e organização nos dados financeiros:** 10%\n\n\n## Causas dos problemas e suas probabilidades\n\n* **Falta de um plano de preços estratégico:** 40%\n* **Ausência de um sistema de gestão integrado:** 30%\n* **Falta de treinamento para funcionários em gestão financeira:** 20%\n* **Processos internos ineficientes:** 10%\n\n\n## Propostas de melhorias e suas probabilidades\n\n* **Implementação de um sistema de gestão de academias (MvK Gym Manager):** 50% (Automatiza processos, melhora controle financeiro e facilita a análise de dados).\n* **Revisão e otimização do plano de preços:** 30% (Oferecer planos com diferentes faixas de preços, valorizando os planos mais completos e limitando descontos excessivos).\n* **Treinamento para a equipe em gestão financeira básica:** 20% (Capacitar funcionários a identificar e evitar desperdícios, controlar as despesas e aplicar os planos de preços com eficácia).\n\n\n## Visão Crítica do conjunto de dados\n\nA principal deficiência é a falta de organização e clareza nos dados financeiros.  A ausência de informações detalhadas sobre os descontos aplicados, a falta de identificação dos beneficiários e os motivos vagos comprometem a análise completa.  É crucial implementar um sistema de gestão como o MvK Gym Manager para centralizar e organizar as informações financeiras, além de investir em treinamento para a equipe. A estratégia de preços necessita de revisão, buscando aumentar a receita média por aluno e reduzir a concessão de descontos sem critérios claros e justificáveis.  A alta incidência de descontos significativos sugere a necessidade urgente de uma análise mais detalhada das políticas comerciais da academia para evitar prejuízos.\n\nImplementar o MvK Gym Manager com urgência é a ação mais relevante.  Após a implementação do sistema, deve-se realizar uma análise profunda de todos os dados históricos para identificar tendências, definir metas e criar um plano de ação detalhado para melhorar a rentabilidade da academia.\n\n',
  //   data: {
  //     receitas: 2668.5,
  //     despesas: 200,
  //     fluxoDeCaixa: 2468.5,
  //     problemas: [
  //       {
  //         name: 'Baixa receita média por aluno',
  //         probabilidade: 70,
  //       },
  //       {
  //         name: 'Gestão ineficiente de descontos',
  //         probabilidade: 20,
  //       },
  //       {
  //         name: 'Falta de controle e organização nos dados financeiros',
  //         probabilidade: 10,
  //       },
  //     ],
  //     causas: [
  //       {
  //         name: 'Falta de um plano de preços estratégico',
  //         probabilidade: 40,
  //       },
  //       {
  //         name: 'Ausência de um sistema de gestão integrado',
  //         probabilidade: 30,
  //       },
  //       {
  //         name: 'Falta de treinamento para funcionários em gestão financeira',
  //         probabilidade: 20,
  //       },
  //       {
  //         name: 'Processos internos ineficientes',
  //         probabilidade: 10,
  //       },
  //     ],
  //     melhorias: [
  //       {
  //         name: 'Implementação de um sistema de gestão de academias (MvK Gym Manager)',
  //         probabilidade: 50,
  //       },
  //       {
  //         name: 'Revisão e otimização do plano de preços',
  //         probabilidade: 30,
  //       },
  //       {
  //         name: 'Treinamento para a equipe em gestão financeira básica',
  //         probabilidade: 20,
  //       },
  //     ],
  //     chartData: {
  //       name: 'Receitas vs Despesas',
  //       type: 'bar',
  //       series: [
  //         {
  //           name: 'Receitas',
  //           value: 2668.5,
  //         },
  //         {
  //           name: 'Despesas',
  //           value: 200,
  //         },
  //       ],
  //     },
  //   },
  //   orientacoes:
  //     'Utilize o MvK Gym Manager para otimizar a gestão financeira da academia.  Importe os dados existentes, revise os planos de preços e treine sua equipe para utilizar o sistema eficazmente.  Após a implementação, monitore os indicadores financeiros regularmente para garantir a sustentabilidade do negócio.',
  //   html: '<!DOCTYPE html><html><head><title>Relatório Financeiro MvK Gym</title><style>body {font-family: sans-serif; color: black;} h4 {font-size: 1.2em;}</style></head><body><h4>Relatório Financeiro MvK Gym</h4><p>A MvK Gym apresenta um cenário financeiro que requer atenção imediata.  Há indícios de problemas na gestão de receitas e algumas inconsistências nos dados fornecidos, que serão detalhadas a seguir.</p><h4>Cálculo exato de receitas e despesas</h4><p>Após análise detalhada das transações financeiras, foram identificadas as seguintes receitas e despesas.  É importante ressaltar que a inconsistência em algumas informações (descrições vagas e datas de lançamento conflitantes) dificultaram uma análise mais precisa.</p><p><strong>Receitas:</strong><br>Mensalidades: R$ 2.268,50 (considerando descontos)<br>Diárias: R$ 150<br>Aulas Particulares: R$ 250<br><strong>Total de Receitas (com descontos): R$ 2.668,50</strong></p><p><strong>Despesas:</strong><br>Combustível: R$ 120<br>Reparos: R$ 80<br><strong>Total de Despesas: R$ 200</strong></p><p><strong>Fluxo de Caixa (Receitas - Despesas): R$ 2.468,50</strong></p><h4>Listagem dos descontos principais</h4><p><strong>Desconto 1:</strong> Mensalidade de R$ 300,00 reduzida para R$ 150,00 (50% de desconto). Motivo: Não especificado, necessita investigação. Beneficiário: Não especificado, necessita investigação.<br><strong>Desconto 2:</strong> Mensalidade de R$ 150,00 reduzida para R$ 148,50 (1% de desconto). Motivo: Não especificado, necessita investigação. Beneficiário: Alana.</p><p><strong>Valor Total de Descontos: R$ 151,50</strong></p><h4>Identificação de problemas e suas probabilidades</h4><p>Baixa receita média por aluno: 70%<br>Gestão ineficiente de descontos: 20%<br>Falta de controle e organização nos dados financeiros: 10%</p><h4>Causas dos problemas e suas probabilidades</h4><p>Falta de um plano de preços estratégico: 40%<br>Ausência de um sistema de gestão integrado: 30%<br>Falta de treinamento para funcionários em gestão financeira: 20%<br>Processos internos ineficientes: 10%</p><h4>Propostas de melhorias e suas probabilidades</h4><p>Implementação de um sistema de gestão de academias (MvK Gym Manager): 50% (Automatiza processos, melhora controle financeiro e facilita a análise de dados).<br>Revisão e otimização do plano de preços: 30% (Oferecer planos com diferentes faixas de preços, valorizando os planos mais completos e limitando descontos excessivos).<br>Treinamento para a equipe em gestão financeira básica: 20% (Capacitar funcionários a identificar e evitar desperdícios, controlar as despesas e aplicar os planos de preços com eficácia).</p><h4>Visão Crítica do conjunto de dados</h4><p>A principal deficiência é a falta de organização e clareza nos dados financeiros.  A ausência de informações detalhadas sobre os descontos aplicados, a falta de identificação dos beneficiários e os motivos vagos comprometem a análise completa.  É crucial implementar um sistema de gestão como o MvK Gym Manager para centralizar e organizar as informações financeiras, além de investir em treinamento para a equipe. A estratégia de preços necessita de revisão, buscando aumentar a receita média por aluno e reduzir a concessão de descontos sem critérios claros e justificáveis.  A alta incidência de descontos significativos sugere a necessidade urgente de uma análise mais detalhada das políticas comerciais da academia para evitar prejuízos.</p><p>Implementar o MvK Gym Manager com urgência é a ação mais relevante.  Após a implementação do sistema, deve-se realizar uma análise profunda de todos os dados históricos para identificar tendências, definir metas e criar um plano de ação detalhado para melhorar a rentabilidade da academia.</p><h4>Orientações</h4><p>Utilize o MvK Gym Manager para otimizar a gestão financeira da academia.  Importe os dados existentes, revise os planos de preços e treine sua equipe para utilizar o sistema eficazmente.  Após a implementação, monitore os indicadores financeiros regularmente para garantir a sustentabilidade do negócio.</p></body></html>',
  // };
  chartData: any;
  charts: any[] = [];

  ngOnInit() {
    if (this.data) {
      this.getAnalisys();
      // setTimeout(() => {
      //   this.report = this.analisys.report;
      //   console.log('this.analisys.report: ', this.analisys);

      //   this.loading = false;
      // }, 2500);
    } else {
      const message = 'Nao foi possivel carregar a analise';

      this.modalController.dismiss(message);
    }
  }

  getAnalisys() {
    this.loading = true;
    this.error = '';
    this.aiService.getAnaliseFinanceira(this.data).subscribe({
      next: (res: any) => {
        console.log(res);
        this.analisys = res;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  @ViewChild('reportContent') reportContent!: ElementRef; // Referência à div principal do relatório
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  copyReport() {
    const content = this.analisys.report;

    navigator.clipboard.writeText(content).then(() => {
      alert('Relatório copiado com sucesso');
    });
  }

  async downloadPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;

    const htmlContent = this.analisys.html;

    pdf.html(htmlContent, {
      x: margin,
      y: margin,
      windowWidth: 650,
      width: pdf.internal.pageSize.getWidth() - 2 * margin,
      margin: [
        margin, // Adicionando 10mm à margem esquerda
        margin + 10, // Adicionando 10mm à margem superior
        margin + 15, // Adicionando 15mm à margem inferior
        margin + 10,
      ], // Tentativa de definir margens (pode não funcionar como esperado com fromHTML)

      callback: (doc: jsPDF) => {
        // Adicionar o gráfico como imagem separada
        // const chartCanvas = this.barChartCanvas.nativeElement;
        // if (chartCanvas) {
        //   const chartImgData = chartCanvas.toDataURL('image/png', 1.0);
        //   doc.addPage();
        //   const chartImgProps = doc.getImageProperties(chartImgData);
        //   const chartPdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        //   const chartPdfHeight = (chartImgProps.height * chartPdfWidth) / chartImgProps.width;
        //   doc.addImage(chartImgData, 'PNG', margin, margin, chartPdfWidth, chartPdfHeight);
        // }
        doc.save('relatorio_financeiro.pdf');
      },
    });
  }

  gerarRelatorioPDF() {
    const pdfMaker = {
      ...pdfMake,
      vfs: pdfFonts['vfs']
    }

    const documentDefinition = {
      content: [
        { text: this.analisys.html, style: 'html-doc' } // Incluindo o HTML diretamente
      ],
      styles: {
        html: {
          // Você pode adicionar estilos gerais aqui, mas lembre-se das limitações
          fontSize: 10,
          lineHeight: 1.2
        }
      }
    };
    pdfMaker
      .createPdf(documentDefinition as any)
      .getDataUrl((dataUrl: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'relatorio_mvk_gym.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  // Função auxiliar para extrair seções do relatório Markdown
  formatarSecaoMarkdown(markdown: string, tituloSecao: string, style: string) {
    const inicio = markdown.indexOf(tituloSecao);
    console.log('tituloSecao: ', tituloSecao);

    console.log('inicio: ', inicio);

    if (inicio === -1) {
      return null;
    }


    console.log('inicio: ', inicio);

    let fim = markdown.indexOf('##', inicio + tituloSecao.length);
    if (fim === -1) {
      fim = markdown.length;
    }
    console.log('fim: ', fim);

    const conteudo = markdown
      .substring(inicio + tituloSecao.length, fim)
      .trim();

    console.log('conteudo: ', conteudo);

    return [
      { text: tituloSecao.replace('## ', ''), style: style },
      { text: conteudo, style: 'paragraph' },
    ];
  }
}

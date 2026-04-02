import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage {
  public faqCategories: {
    name: string;
    icon: string;
    questions: {
      q: string;
      a: string;
      videoId?: string; // ID do vídeo no YouTube
      videoUrl?: any;
    }[]
  }[] = []

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.faqCategories = [
      {
        name: 'Primeiros Passos',
        icon: 'rocket-outline',
        questions: [
          {
            q: 'O que é o MvK Gym Manager?',
            a: 'O MvK Gym Manager é uma plataforma completa para academias, oferecendo ferramentas para gestão de alunos, treinos, finanças e muito mais.',
          },
          {
            q: 'Como alterar as informações da minha academia?',
            a: 'Para alterar as informações da sua academia, vá até a aba "Configurações" e edite os campos desejados.',
            videoId: '97fJEksIgWo',
            videoUrl: this.sanitizeVideoUrl('97fJEksIgWo')
          }
        ]
      },
      {
        name: 'Gestão de Exercícios',
        icon: 'barbell-outline',
        questions: [
          {
            q: 'Por que não consigo encontrar o botão "Editar" em alguns exercícios?',
            a: 'Provavelmente esse exercício é um item "Oficial" do sistema. Somente exercícios criados pela sua própria academia podem ser modificados por você.'
          },
          {
            q: 'O que acontece se eu cadastrar uma URL de imagem inválida?',
            a: 'O sistema detectará a falha no carregamento e mostrará automaticamente uma imagem ilustrativa padrão para não deixar o card vazio.'
          },
          {
            q: 'Filtrei por "Meus Exercícios" e a lista está vazia. O que houve?',
            a: 'Isso significa que sua academia ainda não criou nenhum exercício personalizado. Todo o catálogo atual que você está vendo é o Global/Oficial.'
          },
          {
            q: 'Preciso preencher Grupo Muscular e Músculo Alvo obrigatoriamente?',
            a: 'Não. Caso o exercício seja muito específico ou você não queira classificar agora, pode selecionar a opção "SEM ESPECIFICAÇÃO". O único campo sempre obrigatório é o Nome do Exercício.'
          }
        ]
      },
      {
        name: 'Gestão de Treinos',
        icon: 'fitness-outline',
        questions: [
          {
            q: 'Como vincular uma ficha de treino a um aluno?',
            a: 'No perfil do aluno, acesse a aba "Treinos" e selecione "Nova Ficha". Você pode montar o treino do zero ou replicar um modelo existente.'
          },
          {
            q: 'Posso importar qualquer planilha Excel?',
            a: 'Não. Você deve seguir o Modelo Padrão disponível para download no botão "Baixar Modelo" na tela de importação. Planilhas fora do formato não serão processadas.'
          },
          {
            q: 'O que são "Exercícios Órfãos" no resumo da importação?',
            a: 'São exercícios presentes na sua planilha que não foram encontrados no cadastro do sistema. Ao processar a importação, eles serão criados automaticamente com o selo Academia na sua base.'
          }
        ]
      },
      {
        name: 'Gestão de Alunos',
        icon: 'people-outline',
        questions: [
          {
            q: 'Como o aluno acessa o treino que eu prescrevi?',
            a: 'Assim que você salva o treino no perfil dele, o aluno pode acessar via aplicativo MvK Gym Manager usando o seu CPF e senha. Caso ainda não possua, basta solicitar redefinição no app.'
          },
          {
            q: 'Posso cadastrar mais de uma anamnese para o mesmo aluno?',
            a: 'Não. O sistema mantém apenas uma ficha de anamnese atualizável, permitindo que você e sua equipe construam treinos baseados na saúde atual do aluno.'
          },
          {
            q: 'O aluno consegue editar o próprio treino?',
            a: 'Não. O aluno tem visão de apenas leitura e execução. Ele poderá marcar séries como feitas e registrar a carga utilizada no dia, mas não pode alterar a estrutura do treino.'
          }
        ]
      },
      {
        name: 'Gestão Financeira',
        icon: 'cash-outline',
        questions: [
          {
            q: 'Como faço para dar baixa no pagamento de um aluno?',
            a: 'Na aba de Financeiro > Mensalidades, localize o aluno e clique no ícone de "Confirmar Recebimento" (Check). Você poderá informar a data e o meio de pagamento.'
          },
          {
            q: 'O sistema gera boletos ou links de Pix automaticamente?',
            a: 'Atualmente, o MvK Gym Manager atua como um gerenciador de fluxo de caixa. A cobrança deve ser realizada via sua plataforma de pagamentos preferida ou banco.'
          },
          {
            q: 'Como registro uma despesa recorrente (ex: Aluguel)?',
            a: 'Ao cadastrar uma despesa, você pode marcar a opção "Repetir Mensalmente". O sistema criará automaticamente o lançamento para os próximos meses.'
          }
        ]
      },
      {
        name: 'Sistema de Check-in',
        icon: 'qr-code-outline',
        questions: [
          {
            q: 'O QR Code de Check-in é estático ou dinâmico?',
            a: 'O QR Code é único por empresa, impedindo que alunos ingressem outras academias parceiras por engano. Ele é gerado em tempo real e os alunos podem escanear diretamente da recepção.'
          }
        ]
      }
    ];
  }


  sanitizeVideoUrl(videoId: string) {
    return this.sanitizer.bypassSecurityTrustUrl(`https://www.youtube.com/watch?v=${videoId}`);
  }
}

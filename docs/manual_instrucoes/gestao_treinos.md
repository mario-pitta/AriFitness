# 📋 Manual de Instruções: Gestão de Treinos (MvK Gym Manager)

O módulo de Treinos do **MvK Gym Manager** permite criar, importar e editar planilhas completas de exercícios para seus alunos de forma ágil e organizada.

---

## 1. Importação de Planilhas (Excel)

Para economizar tempo, você pode importar treinos inteiros usando planilhas Excel.

### Como importar:
1.  Acesse **Administração > Treinos > Importar**.
2.  Arraste ou selecione o seu arquivo `.xlsx`.
3.  O sistema lerá os dados e apresentará um resumo dos exercícios encontrados.
4.  **Alerta de Exercícios Novos**: Se o sistema detectar exercícios que não existem no nosso catálogo, você verá um aviso de **"Exercícios Órfãos"**. 
    *   Você deve confirmar a criação desses itens na base de dados da sua academia para prosseguir.
    *   **Importante**: Tenha responsabilidade ao criar novos nomes de exercícios para evitar duplicidades inúteis na sua base.

---

## 2. Editor de Treinos

O Editor é onde você ajusta as variáveis de carga e repetição para cada exercício.

### Funcionalidades do Editor:
*   **Adicionar Exercícios**: Use a lupa de pesquisa para buscar no catálogo (Oficiais e da sua Academia).
*   **Ajuste de Séries/Reps**: Defina o número de séries, repetições, carga (kg), tempo de descanso e método de execução (ex: Bi-set, Drop-set).
*   **Reordenação**: Você pode arrastar os exercícios para mudar a ordem de execução do treino. 

---

## 3. Prescrição Dinâmica de Repetições

O **MvK Gym Manager** permite uma prescrição flexível nas repetições:
*   **Fixo**: Ex: 10, 12, 15.
*   **Faixa (Range)**: Ex: 8 a 10, 12-15.
*   **Até a Falha**: Digite "F" ou "Falha" para orientar o aluno a ir até o limite.

---

## 4. FAQ - Perguntas Frequentes (Gestão de Treinos)

**Q: Posso importar qualquer planilha Excel?**  
**R**: Não. Você deve seguir o **Modelo Padrão** disponível para download no botão "Baixar Modelo" na tela de importação. Planilhas fora do formato não serão processadas.

**Q: O que são "Exercícios Órfãos" no resumo da importação?**  
**R**: São exercícios presentes na sua planilha que não foram encontrados no cadastro do sistema. Ao processar a importação, eles serão criados automaticamente com o selo **Academia** na sua base.

**Q: Posso editar um exercício diretamente de dentro de um treino?**  
**R**: Através da lupa de pesquisa no Editor, você pode clicar no ícone de "Ver detalhes" para conferir a técnica. Para editar o nome/imagem do exercício original, use o módulo de **Gestão de Exercícios**.

**Q: Como faço para aplicar o mesmo treino para vários alunos?**  
**R**: Você pode salvar o treino como um **Modelo (Template)**. Depois, ao editar a ficha de um aluno específico, basta escolher "Carregar de um Modelo".

**Q: Se eu apagar um exercício da minha academia, o que acontece com os treinos que já o usam?**  
**R**: O exercício continuará aparecendo nos treinos antigos para histórico, mas ficará marcado como "Inativo" e não poderá ser adicionado a novos treinos.

---
*Manual versão 1.12.0 - 2026*

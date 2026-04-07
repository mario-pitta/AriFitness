/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { TransacaoFinanceira } from './TransacaoFinanceira.interface';
import { UsuarioService } from 'src/usuario/usuario.service';
import { EmpresaService } from 'src/empresa/empresa.service';

const tableName = 'transacao_financeira';
@Injectable()
export class TransacaoFinanceiraService {
  constructor(private database: DataBaseService, private usuarioService: UsuarioService, private empresaService: EmpresaService) { }

  /**
   * The `findAll` function retrieves all records from a specified table in a database.
   * @returns An array of all records from the specified table in the database with all columns
   * selected.
   */
  async findAll(filter: Partial<TransacaoFinanceira> | TransacaoFinanceira | any) {
    console.log('findAll: ', filter);
    const { data_inicio, data_fim, orderBy, asc } = filter;

    delete filter.data_inicio;
    delete filter.data_fim;
    delete filter.orderBy;
    delete filter.asc;
    delete filter.empresa_nome;

    const categories = filter.categorias ? (Array.isArray(filter.categorias) ? filter.categorias : filter.categorias.toString().split(',')) : [];
    delete filter.categorias;

    const status = filter.status;
    delete filter.status;

    const endpoint = filter.endpoint;
    delete filter.endpoint;

    console.log('categories = ', categories);

    // Only apply status filters if status is explicitly provided and not 'todos'
    if (status && status !== 'todos') {
      filter.fl_ativo = status === 'cancelado' ? false : true;
      if (status !== 'cancelado') {
        filter.fl_pago = status === 'pago' ? true : false;
      }
    }

    let queryBuilder = this.database.supabase
      .from(tableName)
      .select(
        `
        *,
        membro: usuario!transacao_financeira_pago_por_fkey(id, nome),
        categoria: categoria_transacao_financeira!transacao_financeira_tr_categoria_id_fkey(id, descricao),
        tipo: tipo_transacao_financeira!transacao_financeira_tr_tipo_id_fkey(id, descricao),
        empresa: empresa(id, nome, logo_url)
        `,
      )
      .match({ ...filter });

    if (categories.length > 0) {
      queryBuilder = queryBuilder.in('tr_categoria_id', categories);
    }

    if (data_inicio) {
      queryBuilder = queryBuilder.gte('data_lancamento', data_inicio);
    }

    if (data_fim) {
      queryBuilder = queryBuilder.lte('data_lancamento', data_fim);
    }

    const { data, error } = await queryBuilder.order(orderBy || 'data_lancamento', {
      ascending: asc !== undefined ? asc : false,
    });

    console.log('data = ', data?.length || 0, ' records');
    if (error) console.log('error = ', error);

    return { data, error };
  }


  validateTransacaoFinanceira(transacaoFinanceira: TransacaoFinanceira) {
    if (!transacaoFinanceira.tr_categoria_id) {
      throw new HttpException('Categoria da transação financeira não informada', HttpStatus.BAD_REQUEST);
    }

    if (!transacaoFinanceira.tr_tipo_id) {
      throw new HttpException('Tipo da transação financeira não informado', HttpStatus.BAD_REQUEST);
    }

    if (!transacaoFinanceira.data_lancamento) {
      throw new HttpException('Data da transação financeira não informada', HttpStatus.BAD_REQUEST);
    }

    if (typeof transacaoFinanceira.pago_por === 'object') {
      transacaoFinanceira = {
        ...transacaoFinanceira,
        pago_por: (transacaoFinanceira.pago_por as any)?.id,
      }
    }

    switch (transacaoFinanceira.tr_categoria_id) {
      case 1:
      case 14: //MENSALIDADE E MATRICULA
        if (!transacaoFinanceira.pago_por) {
          throw new HttpException('Membro da transação financeira não informado', HttpStatus.BAD_REQUEST);
        }
        break;

      default:
        break;
    }

    return transacaoFinanceira;
  }

  /**
   * The `create` function inserts a new record on database using the provided user data.
   * @param {Usuario} body - The `body` parameter in the `create` function likely represents the data or
   * object of type `Usuario` that you want to insert into a database table. It contains the information
   * or fields that you want to store in the database.
   * @returns The `create` function is returning the result of inserting the `body` object into the
   * specified table in the database.
   */
  async create(body: TransacaoFinanceira) {
    console.log('body: ', body);


    body = await this.validateTransacaoFinanceira(body);

    return this.database.supabase
      .from(tableName)
      .insert(body, {})
      .select('*')
      .single()
      .then(async _res => {


        if (_res.error) return new HttpException(_res.error, HttpStatus.INTERNAL_SERVER_ERROR, {
          cause: _res.error,
        });

        const newTransacaoFinanceira = _res.data as TransacaoFinanceira;
        if (newTransacaoFinanceira) {
          this.updateEntity(newTransacaoFinanceira);
        }
        return _res
      });
  }

  /**
   * The `update` function updates a record on database table with the provided partial user
   * data.
   * @param body - The `body` parameter in the `update` function is a partial object of type `Usuario`.
   * It contains the data that needs to be updated in the database for a specific user.
   * @returns The `update` method is returning a promise that represents the result of updating the
   * record in the database table specified by `tableName` with the data provided in the `body` object.
   */
  update(body: Partial<TransacaoFinanceira>) {
    return this.database.supabase
      .from(tableName)
      .update(body)
      .eq('id', body.id)
      .select('*');
  }

  /**
   * The function `getTiposTransacaoFinanceira` retrieves task types from a database based on a given filter.
   * @param filter - The filter parameter is an object that specifies the criteria for filtering the
   * results of the query. In this case, it filters the results based on the value of the "fl_ativo"
   * field being a boolean value.
   */
  getTiposTransacaoFinanceira(filter: { fl_ativo: boolean }) {
    return this.database.supabase
      .from('tipo_transacao_financeira')
      .select('*')
      .match(filter);
  }

  getCategoriasTransacaoFinanceira(filter: {
    fl_ativo: boolean;
    tr_tipo_id: number;
  }) {
    return this.database.supabase
      .from('categoria_transacao_financeira')
      .select(
        `
          *
        `,
      )
      .match(filter);
  }

  async updateEntity(transacaoFinanceira: TransacaoFinanceira) {
    console.log('updateEntity - transacaoFinanceira: ', transacaoFinanceira);

    switch (transacaoFinanceira.tr_categoria_id) {
      case 1: //MENSALIDADE
      case 14: //MATRICULA
        console.log('MENSALIDADE/MATRICULA: ');

        await this.usuarioService.update({
          id: transacaoFinanceira.pago_por,
          data_ultimo_pagamento: transacaoFinanceira.data_lancamento,
        });
        break;

      default:
        break;
    }
  }

  async importFinances(empresaId: string, transactions: any[]) {
    const transactionsToInsert = transactions.map((t) => ({
      ...t,
      empresa_id: empresaId,
      fl_ativo: true,
    }));

    return this.database.supabase
      .from(tableName)
      .insert(transactionsToInsert)
      .select();
  }

  async generatePdfReport(filter: any, res: any) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfMake = require('pdfmake');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const axios = require('axios');



    console.log('generatePdfReport filter = ', filter)
    const data_inicio = filter.data_inicio ? new Date(filter.data_inicio).toISOString() : new Date().toISOString();
    const data_fim = filter.data_fim ? new Date(filter.data_fim).toISOString() : new Date().toISOString();


    const response = await this.findAll(filter);
    const empresa = await this.empresaService.getEmpresa(filter.empresa_id);


    if (response.error) {
      return res.status(500).send(response.error);
    }

    const transacoes = response.data || [];

    const totalReceitas = transacoes
      .filter((t: any) => t.tr_tipo_id === 1)
      .reduce((acc: number, t: any) => acc + (t.valor_final || 0), 0);

    const totalDespesas = transacoes
      .filter((t: any) => t.tr_tipo_id === 2)
      .reduce((acc: number, t: any) => acc + (t.valor_final || 0), 0);

    const saldoFinal = totalReceitas - totalDespesas;

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatDateStr = (dateStr: string) => {
      console.log('dateStr = ', dateStr)
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-');

      return `${day}/${month}/${year}`;
    };

    const headerColumns = ['Data', 'Descrição', 'Categoria', 'Status', 'Valor'];

    const createTableBody = (txs: any[]) => {
      const body: any[] = [
        headerColumns.map(text => ({ text, style: 'tableHeader' }))
      ];
      txs.forEach((t: any) => {
        const status = t.fl_ativo ? (t.fl_pago ? 'Pago' : 'Pendente') : 'Cancelado';
        body.push([
          formatDateStr(t.data_lancamento),
          t.descricao || '',
          t.categoria?.descricao?.toUpperCase() || '',
          status,
          { text: formatCurrency(t.valor_final), color: t.tr_tipo_id === 1 ? '#2dd36f' : '#eb445a', alignment: 'right' }
        ] as any);
      });
      return body;
    };

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };
    pdfMake.setFonts(fonts);

    const empresaDados = empresa.data as any;
    const empresaNome = empresaDados?.nome_fantasia?.toUpperCase() || 'EMPRESA';
    console.log('data_inicio = ', data_inicio)
    console.log('filter.data_inicio = ', filter.data_inicio)
    const periodoInicio = data_inicio ? formatDateStr(data_inicio) : 'Início';
    console.log('periodoInicio = ', periodoInicio)

    console.log('data_fim = ', data_fim)
    console.log('filter.data_fim = ', filter.data_fim)
    const periodoFim = data_fim ? formatDateStr(data_fim) : 'Atualmente';
    console.log('periodoFim = ', periodoFim)

    // Categorias distintas
    const categoriasUnique = [...new Set(transacoes.map((t: any) => t.categoria?.descricao))].filter(Boolean) as string[];
    const categoriasInfo = categoriasUnique.length > 0 ? categoriasUnique.join(', ').toUpperCase() : 'TODAS AS CATEGORIAS';

    // Fetch Empresa Logo
    let empresaLogoBase64 = null;
    if (empresaDados?.logo_url) {
      try {
        const logoReq = await axios.get(empresaDados.logo_url, { responseType: 'arraybuffer' });
        const mime = logoReq.headers['content-type'] || 'image/jpeg';
        empresaLogoBase64 = `data:${mime};base64,` + Buffer.from(logoReq.data, 'binary').toString('base64');
      } catch (err) {
        console.error('Failed to load empresa logo:', err.message);
      }
    }

    // Load MvK Logo
    let mvkLogo = null;
    try {
      const { mvkLogoBase64 } = require('../core/logoBase64');
      mvkLogo = mvkLogoBase64;
    } catch (e) { }

    const content: any[] = [];

    // Header Content (Company Logo -> Company Name -> Title -> Date/Categories)
    if (empresaLogoBase64) {
      content.push({ image: empresaLogoBase64, fit: [80, 80], alignment: 'center', margin: [0, 0, 0, 10] });
    }
    content.push({ text: empresaNome, style: 'mainTitle' });
    content.push({ text: 'Relatório Financeiro', style: 'subTitle' });
    content.push({ text: `Período: de ${periodoInicio} a ${periodoFim}`, style: 'dateInfo' });
    if (filter.categorias) {
      content.push({ text: `Categorias: ${categoriasInfo}`, style: 'categoryInfo' });
    }
    content.push({ text: `Gerado em: ${formatDateStr(new Date().toISOString())}`, style: 'dateInfo' });

    content.push({ text: 'Todas as Transações', style: 'sectionTitle' });
    content.push({
      style: 'tableExample',
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: createTableBody(transacoes)
      },
      layout: 'lightHorizontalLines'
    });

    content.push({
      margin: [0, 20, 0, 0],
      table: {
        widths: ['*', 'auto'],
        body: [
          ['Total de Receitas:', { text: formatCurrency(totalReceitas), color: '#2dd36f', bold: true }],
          ['Total de Despesas:', { text: formatCurrency(totalDespesas), color: '#eb445a', bold: true }],
          [{ text: 'Saldo Final:', bold: true }, { text: formatCurrency(saldoFinal), bold: true, fontSize: 14 }]
        ]
      },
      layout: 'noBorders'
    });

    // Breakdown per Category
    if (categoriasUnique.length > 0) {
      content.push({ text: '', pageBreak: 'before' });
      content.push({ text: 'Detalhamento por Categoria', style: 'sectionTitle', margin: [0, 10, 0, 15] });

      const txsMappedByCategory = categoriasUnique.map(catName => {
        return {
          catName,
          catTxs: transacoes.filter((t: any) => t.categoria?.descricao === catName)
        };
      }).filter(d => d.catTxs.length > 0);

      const receitasCatList = txsMappedByCategory
        .filter(d => d.catTxs[0].tr_tipo_id === 1)
        .sort((a, b) => a.catName.trim().localeCompare(b.catName.trim()));

      const despesasCatList = txsMappedByCategory
        .filter(d => d.catTxs[0].tr_tipo_id === 2)
        .sort((a, b) => a.catName.trim().localeCompare(b.catName.trim()));

      const orderedCatList = [...receitasCatList, ...despesasCatList];

      orderedCatList.forEach(({ catName, catTxs }) => {
        const isReceita = catTxs[0].tr_tipo_id === 1;
        const totalCat = catTxs.reduce((acc: number, t: any) => acc + (t.valor_final || 0), 0);

        content.push({ text: `CATEGORIA: ${catName.toUpperCase()}`, style: 'categoryHeader', color: isReceita ? '#28a745' : '#dc3545' });
        content.push({
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: createTableBody(catTxs)
          },
          layout: 'lightHorizontalLines'
        });
        content.push({
          margin: [0, 5, 0, 20],
          text: `Total ${catName.toUpperCase()}: ${formatCurrency(totalCat)}`,
          alignment: 'right',
          bold: true,
          color: isReceita ? '#2dd36f' : '#eb445a'
        });
      });
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: 'Helvetica' },
      header: (currentPage: number) => {
        return {
          margin: [40, 20, 40, 0],
          columns: [
            mvkLogo
              ? { image: mvkLogo, width: 25, margin: [0, -5, 5, 0] }
              : { text: '' },
            { text: 'MvK Gym Manager', style: 'headerLeft' },
            { text: `Pág. ${currentPage}`, alignment: 'right', fontSize: 8, color: '#666' }
          ]
        };
      },
      content: content,
      styles: {
        headerLeft: { fontSize: 12, bold: true, color: '#3171e0', margin: [0, 2, 0, 0] },
        mainTitle: { fontSize: 24, bold: true, margin: [0, 0, 0, 8], alignment: 'center', color: '#111' },
        subTitle: { fontSize: 16, margin: [0, 0, 0, 5], alignment: 'center', color: '#444' },
        dateInfo: { fontSize: 11, color: '#666', margin: [0, 0, 0, 5], alignment: 'center' },
        categoryInfo: { fontSize: 11, color: '#444', margin: [0, 0, 0, 5], alignment: 'center', italics: true },
        sectionTitle: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], color: '#222', alignment: 'center' },
        categoryHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
        tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#f4f5f8' },
        tableExample: { margin: [0, 5, 0, 5], fontSize: 10 }
      }
    };

    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      const buffer = await pdfDoc.getBuffer();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Financeiro.pdf');
      res.send(buffer);
    } catch (err) {
      console.error('Erro gerando PDF:', err);
      return res.status(500).send({ error: 'Erro gerando relatorio PDF.' });
    }
  }
}

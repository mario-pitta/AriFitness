/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/providers#services
*/

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Empresa } from './empresa.interface';
import { StorageService } from 'src/datasource/storage.service';
import { PostgrestSingleResponse } from '@supabase/supabase-js';


@Injectable()
export class EmpresaService {
  async getPublicEmpresa(empresaId: string) {
    const { data, error } = await this.databaseService.supabase.from('empresa').select(`
      id, nome, logo_url, banner_url, cnpj
    `).eq('id', empresaId).single();

    if (error) {
      console.error('Error getting public empresa: ', error);
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }



    return data;



  }
  constructor(
    private readonly databaseService: DataBaseService,
    private readonly storageService: StorageService,
  ) { }
  async getEmpresa(empresaId: string): Promise<PostgrestSingleResponse<Empresa>> {
    console.log('empresaId: ', empresaId);
    return await this.databaseService.supabase
      .from('empresa')
      .select(
        `
          *,
          horarios(*),
          planos(*),
          servicos:service(*)
        `,
      )
      .eq('id', empresaId)
      .single();
  }

  async createEmpresa(empresa: Empresa) {
    try {
      const { logo_url, banner_url, horarios, planos, servicos } = empresa;

      delete empresa.logo_url;
      delete empresa.banner_url;
      delete (empresa as any).enderecos; // Garante que não vá para o banco
      delete empresa.horarios;
      delete empresa.planos;
      delete empresa.servicos;

      const { data, error } = await this.databaseService.supabase
        .from('empresa')
        .insert(empresa)
        .select()
        .single();

      if (error) throw error;
      const empresaId = data.id;

      const promises = [];

      if (logo_url) {
        promises.push(
          this.storageService
            .uploadImage('empresalogo', 'logo_' + empresaId, logo_url)
            .then((res) => ({ logo_url: res?.fullPath }))
        );
      }

      if (banner_url) {
        promises.push(
          this.storageService
            .uploadImage('empresabanner', 'banner_' + empresaId, banner_url)
            .then((res) => ({ banner_url: res?.fullPath }))
        );
      }

      if (horarios?.length) {
        promises.push(
          this.databaseService.supabase.from('horarios').insert(
            horarios.map((h) => ({ ...h, empresa_id: empresaId }))
          )
        );
      }

      if (planos?.length) {
        promises.push(
          this.databaseService.supabase.from('planos').insert(
            planos.map((p) => ({ ...p, empresa_id: empresaId }))
          )
        );
      }

      if (servicos?.length) {
        promises.push(
          this.databaseService.supabase.from('service').insert(
            servicos.map((s: any) => ({ ...s, empresa_id: empresaId }))
          )
        );
      }

      const results = await Promise.all(promises);
      const updates: any = {};
      results.forEach((res: any) => {
        if (res && (res.logo_url || res.banner_url)) {
          Object.assign(updates, res);
        }
      });

      if (Object.keys(updates).length > 0) {
        await this.databaseService.supabase
          .from('empresa')
          .update(updates)
          .eq('id', empresaId);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateEmpresa(empresa: Empresa) {
    const { logo_url, banner_url, horarios, planos, servicos } = empresa;

    delete empresa.logo_url;
    delete empresa.banner_url;
    delete (empresa as any).enderecos;
    delete empresa.horarios;
    delete empresa.planos;
    delete empresa.servicos;

    const deleteFile = (bucketName: string, path: string) =>
      this.storageService.deleteFileFromBucket(bucketName, path);

    try {
      const promises = [];

      // Imagens
      if (logo_url && logo_url.indexOf('base64') > -1) {
        promises.push(
          deleteFile('empresalogo', 'logo_' + empresa.id)
            .then(() => this.storageService.uploadImage('empresalogo', 'logo_' + empresa.id, logo_url))
            .then(res => ({ logo_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${res?.fullPath}` }))
        );
      }

      if (banner_url && banner_url.indexOf('base64') > -1) {
        promises.push(
          deleteFile('empresabanner', 'banner_' + empresa.id)
            .then(() => this.storageService.uploadImage('empresabanner', 'banner_' + empresa.id, banner_url))
            .then(res => ({ banner_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${res?.fullPath}` }))
        );
      }

      // Horários
      if (horarios) {
        const hToSave = horarios.map(h => ({ ...h, empresa_id: empresa.id }));
        hToSave.forEach(h => { if (!h.id) delete h.id; });
        promises.push(this.databaseService.supabase.from('horarios').upsert(hToSave));
      }

      // Planos
      if (planos) {
        const pToSave = planos.map(p => ({ ...p, empresa_id: empresa.id }));
        pToSave.forEach(p => { if (!p.id) delete p.id; });
        promises.push(this.databaseService.supabase.from('planos').upsert(pToSave));
      }

      // Serviços - primeiro deletar os antigos, depois inserir os novos
      if (servicos) {
        // Deletar serviços existentes da empresa
        const { data: deleteOldServices, error: errorDeleteOldServices } = await this.databaseService.supabase
          .from('service')
          .delete()
          .eq('empresa_id', empresa.id);


        if (errorDeleteOldServices) {
          throw errorDeleteOldServices;
        }

        // Inserir os novos serviços
        const sToSave = servicos.map((s: any) => ({
          empresa_id: empresa.id,
          default_service_id: s.default_service_id || null,
          nome: s.nome,
          descricao: s.descricao || null,
          ativo: s.ativo !== false
        }));
        promises.push(this.databaseService.supabase.from('service').insert(sToSave));
      }

      const results = await Promise.all(promises);

      console.log('results = ', results)

      results.forEach((res: any) => {
        if (res && (res.logo_url || res.banner_url)) {
          Object.assign(empresa, res);
        }
      });

      return await this.databaseService.supabase
        .from('empresa')
        .update(empresa)
        .eq('id', empresa.id)
        .select();

    } catch (error) {
      console.error('Error updating empresa:', error);
      throw error;
    }
  }

  async findAll() {
    return await this.databaseService.supabase
      .from('empresa')
      .select(
        `
          id, nome, email, telefone, endereco, cidade, estado, cep, cnpj, logo_url, banner_url, created_at, updated_at
        `,
      )
      .order('nome', { ascending: true });
  }

  async getPlanoInfo(empresaId: string) {
    console.log('empresaId = ', empresaId)

    const { data: empresa, error } = await this.databaseService.supabase
      .from('empresa')
      .select('id, nome, plano, data_vencimento, limite_alunos, features, status_licenca')
      .eq('id', empresaId)
      .single();

    const { data: assinatura } = await this.databaseService.supabase
      .from('assinatura')
      .select('*')
      .eq('empresa_id', empresaId)
      .single();

    console.log('empresa = ', empresa)

    if (error || !empresa) {
      return { error: { message: 'Empresa não encontrada', error } };
    }

    const { data: alunosCount } = await this.databaseService.supabase
      .from('usuario')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);


    const { data: instrutoresCount } = await this.databaseService.supabase
      .from('usuario')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);

    const { data: equipamentosCount } = await this.databaseService.supabase
      .from('equipamento')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);

    const { data: creditosIaUsados } = await this.databaseService.supabase
      .from('creditos_ia')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);

    return {
      empresa: {
        id: empresa.id,
        nome: empresa.nome,
        plano: empresa.plano || 'Gratuito',
        data_vencimento: empresa.data_vencimento,
        limite_alunos: assinatura.limite_alunos || 50,
        alunos_count: alunosCount || 0,
        features: empresa.features || {},
        status_licenca: empresa.status_licenca || 'ativa',
        instrutores_count: instrutoresCount || 0,
        equipamentos_count: equipamentosCount || 0,
        creditos_ia_usados: creditosIaUsados || 0,
        creditos_ia_limite: assinatura.limite_creditos_ia || 0
      }
    };
  }
}


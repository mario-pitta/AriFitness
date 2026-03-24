import { Injectable, NotFoundException } from '@nestjs/common';
import { DataBaseService } from '../datasource/database.service';
import md5 = require('md5');

@Injectable()
export class TeamMemberService {
    async findByFilters(filters: string, empresaId: string) {
        console.log('TeamMemberService findByFilters filters = ', filters)

        const { data, error } = await this.database.supabase
            .from('team_member')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*)), tipo_usuario:function_id(*)`)
            .eq('empresa_id', empresaId)
            .or(filters)
            .order('nome', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.formatTeamMember);
    }
    constructor(private database: DataBaseService) { }

    private formatTeamMember(inst: any) {
        if (!inst) return null;
        return {
            ...inst,
            specialties: inst.instructor_specialties?.map((is: any) => is.specialty).filter(Boolean) || [],
            services: inst.instructor_services?.map((is: any) => is.service).filter(Boolean) || [],
        };
    }

    async findAll(empresa_id: string): Promise<any[]> {
        const { data, error } = await this.database.supabase
            .from('team_member')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*)), tipo_usuario:function_id(*)`)
            .eq('empresa_id', empresa_id)
            .order('nome', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.formatTeamMember);
    }

    async findByUserId(user_id: string, empresa_id: string): Promise<any | null> {
        const { data, error } = await this.database.supabase
            .from('team_member')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*))`)
            .eq('id', user_id)
            .eq('empresa_id', empresa_id)
            .maybeSingle();

        if (error) throw error;
        return this.formatTeamMember(data);
    }




    async findOne(id: string, empresa_id: string): Promise<any> {
        const { data, error } = await this.database.supabase
            .from('team_member')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*))`)
            .eq('id', id)
            .eq('empresa_id', empresa_id)
            .single();

        if (error || !data) throw new NotFoundException(`Team member ${id} not found`);
        return this.formatTeamMember(data);
    }

    async create(body: any): Promise<any> {
        const { data: member, error } = await this.database.supabase
            .from('team_member')
            .insert([{
                empresa_id: body.empresa_id,
                user_id: body.user_id,
                nome: body.nome,
                telefone: body.telefone,
                email: body.email,
                foto_url: body.foto_url,
                status: body.status || 'ACTIVE',
                salario: body.salario ?? null,
                dias_horas_trabalho: body.dias_horas_trabalho ?? [],
                cpf: body.cpf ?? null,
                ctps: body.ctps ?? null,
                cref: body.cref ?? null,
                password: body.password ? md5(body.password) : null,
                function_id: body.function_id ?? null,
                genero: body.genero ?? null,
            }])
            .select()
            .single();

        if (error) throw error;

        // Relation logic remains the same (specialties/services only for instructors, handled by frontend visibility)
        if (body.specialties && body.specialties.length > 0) {
            const promises = body.specialties.map((s_id: string) =>
                this.database.supabase.from('instructor_specialties').insert({ instructor_id: member.id, specialty_id: s_id })
            );
            await Promise.all(promises);
        }

        if (body.services && body.services.length > 0) {
            const promises = body.services.map((s_id: string) =>
                this.database.supabase.from('instructor_services').insert({ instructor_id: member.id, service_id: s_id })
            );
            await Promise.all(promises);
        }

        return this.findOne(member.id, body.empresa_id);
    }

    async update(id: string, empresa_id: string, body: any): Promise<any> {
        const updateData: any = {};
        if (body.nome !== undefined) updateData.nome = body.nome;
        if (body.telefone !== undefined) updateData.telefone = body.telefone;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.foto_url !== undefined) updateData.foto_url = body.foto_url;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.salario !== undefined) updateData.salario = body.salario;
        if (body.dias_horas_trabalho !== undefined) updateData.dias_horas_trabalho = body.dias_horas_trabalho;
        if (body.cpf !== undefined) updateData.cpf = body.cpf;
        if (body.ctps !== undefined) updateData.ctps = body.ctps;
        if (body.cref !== undefined) updateData.cref = body.cref;
        if (body.password !== undefined) updateData.password = body.password ? md5(body.password) : null;
        if (body.function_id !== undefined) updateData.function_id = body.function_id;
        if (body.genero !== undefined) updateData.genero = body.genero;

        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            const { error } = await this.database.supabase
                .from('team_member')
                .update(updateData)
                .eq('id', id)
                .eq('empresa_id', empresa_id);
            if (error) throw error;
        }

        if (body.specialties) {
            await this.database.supabase.from('instructor_specialties').delete().eq('instructor_id', id);
            if (body.specialties.length > 0) {
                const promises = body.specialties.map((s_id: string) =>
                    this.database.supabase.from('instructor_specialties').insert({ instructor_id: id, specialty_id: s_id })
                );
                await Promise.all(promises);
            }
        }

        if (body.services) {
            await this.database.supabase.from('instructor_services').delete().eq('instructor_id', id);
            if (body.services.length > 0) {
                const promises = body.services.map((s_id: string) =>
                    this.database.supabase.from('instructor_services').insert({ instructor_id: id, service_id: s_id })
                );
                await Promise.all(promises);
            }
        }

        return this.findOne(id, empresa_id);
    }

    async remove(id: string, empresa_id: string): Promise<boolean> {
        const { error, count } = await this.database.supabase
            .from('team_member')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('empresa_id', empresa_id);

        if (error) throw error;
        return count ? count > 0 : true;
    }
}

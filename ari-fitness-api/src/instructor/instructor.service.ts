import { Injectable, NotFoundException } from '@nestjs/common';
import { DataBaseService } from '../datasource/database.service';

@Injectable()
export class InstructorService {
    constructor(private database: DataBaseService) { }

    private formatInstructor(inst: any) {
        if (!inst) return null;
        return {
            ...inst,
            specialties: inst.instructor_specialties?.map((is: any) => is.specialty).filter(Boolean) || [],
            services: inst.instructor_services?.map((is: any) => is.service).filter(Boolean) || [],
        };
    }

    async findAll(empresa_id: string): Promise<any[]> {
        const { data, error } = await this.database.supabase
            .from('instructor')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*))`)
            .eq('empresa_id', empresa_id);

        if (error) throw error;
        return (data || []).map(this.formatInstructor);
    }

    async findByUserId(user_id: string, empresa_id: string): Promise<any | null> {
        const { data, error } = await this.database.supabase
            .from('instructor')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*))`)
            .eq('id', user_id)
            .eq('empresa_id', empresa_id)
            .maybeSingle();

        if (error) throw error;
        return this.formatInstructor(data);
    }

    async findOne(id: string, empresa_id: string): Promise<any> {
        const { data, error } = await this.database.supabase
            .from('instructor')
            .select(`*, instructor_specialties(specialty(*)), instructor_services(service(*))`)
            .eq('id', id)
            .eq('empresa_id', empresa_id)
            .single();

        if (error || !data) throw new NotFoundException(`Instructor ${id} not found`);
        return this.formatInstructor(data);
    }

    async create(body: any): Promise<any> {
        const { data: instructor, error } = await this.database.supabase
            .from('instructor')
            .insert([{
                empresa_id: body.empresa_id,
                user_id: body.user_id,
                nome: body.nome,
                telefone: body.telefone,
                foto_url: body.foto_url,
                status: body.status || 'ACTIVE',
                salario: body.salario ?? null,
                dias_horas_trabalho: body.dias_horas_trabalho ?? [],
                genero: body.genero ?? null,
            }])
            .select()
            .single();

        if (error) throw error;

        if (body.specialties && body.specialties.length > 0) {
            const promises = body.specialties.map((s_id: string) =>
                this.database.supabase.from('instructor_specialties').insert({ instructor_id: instructor.id, specialty_id: s_id })
            );
            await Promise.all(promises);
        }

        if (body.services && body.services.length > 0) {
            const promises = body.services.map((s_id: string) =>
                this.database.supabase.from('instructor_services').insert({ instructor_id: instructor.id, service_id: s_id })
            );
            await Promise.all(promises);
        }

        return this.findOne(instructor.id, body.empresa_id);
    }

    async update(id: string, empresa_id: string, body: any): Promise<any> {
        const updateData: any = {};
        if (body.nome !== undefined) updateData.nome = body.nome;
        if (body.telefone !== undefined) updateData.telefone = body.telefone;
        if (body.foto_url !== undefined) updateData.foto_url = body.foto_url;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.salario !== undefined) updateData.salario = body.salario;
        if (body.dias_horas_trabalho !== undefined) updateData.dias_horas_trabalho = body.dias_horas_trabalho;

        if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            const { error } = await this.database.supabase
                .from('instructor')
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
            .from('instructor')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('empresa_id', empresa_id);

        if (error) throw error;
        return count ? count > 0 : true;
    }
}

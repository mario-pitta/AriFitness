import { Injectable, NotFoundException } from '@nestjs/common';
import { DataBaseService } from '../datasource/database.service';

@Injectable()
export class ServiceService {
    constructor(private database: DataBaseService) { }

    async findAll(empresa_id: string): Promise<any[]> {
        const { data, error } = await this.database.supabase
            .from('service')
            .select('*')
            .eq('empresa_id', empresa_id)
            .order('nome', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async create(body: any): Promise<any> {
        const { data, error } = await this.database.supabase
            .from('service')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, empresa_id: string, body: any): Promise<any> {
        const { data, error } = await this.database.supabase
            .from('service')
            .update(body)
            .eq('id', id)
            .eq('empresa_id', empresa_id)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new NotFoundException(`Service ${id} not found`);
        return data;
    }

    async remove(id: string, empresa_id: string): Promise<boolean> {
        const { error, count } = await this.database.supabase
            .from('service')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('empresa_id', empresa_id);

        if (error) throw error;
        return count ? count > 0 : true;
    }
}

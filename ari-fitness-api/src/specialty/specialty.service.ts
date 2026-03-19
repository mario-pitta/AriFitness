import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../datasource/database.service';

@Injectable()
export class SpecialtyService {
    constructor(private database: DataBaseService) { }

    async findAll(): Promise<any[]> {
        const { data, error } = await this.database.supabase
            .from('specialty')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async create(body: any): Promise<any> {
        const { data, error } = await this.database.supabase
            .from('specialty')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

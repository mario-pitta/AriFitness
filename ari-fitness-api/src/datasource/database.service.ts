import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataBaseService implements OnModuleInit {
  public supabase: SupabaseClient;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('SUPABASE_URL or SUPABASE_KEY is missing in environment variables');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
      console.error('Error creating supabase client:', error);
    }
  }

  getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      this.onModuleInit();
    }

    return this.supabase;
  }
}

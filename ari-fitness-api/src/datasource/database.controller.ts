/* eslint-disable prettier/prettier */
import { Controller, Injectable, Scope } from "@nestjs/common";
import { DataBaseService } from "./database.service";
import { SupabaseClient } from "@supabase/supabase-js";

@Controller({
	scope: Scope.DEFAULT,

})
export class DataBaseController {
	supabase: SupabaseClient;
	constructor(private databaseService: DataBaseService) {
		this.supabase = this.databaseService.getSupabaseClient();

	}


}

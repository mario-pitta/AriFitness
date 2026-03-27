/* eslint-disable prettier/prettier */
import { GeminiModule } from './gemini/gemini.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FichaAlunoModule } from './ficha-usuario/ficha-aluno.module';
import { GrupoMuscularModule } from './grupoMuscular/grupo-muscular.module';
import { TipoUsuarioModule } from './tipoUsuario/tipo-usuario.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { HorarioModule } from './horario/horario.module';
import { PlanoModule } from './plano/plano.module';
import { MusculoModule } from './musculo/musculo.module';
import { EquipamentoModule } from './equipamento/equipamento.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DataBaseModule } from './datasource/database.module';
import { TreinoModule } from './treino/treino.module';
import { ExercicioModule } from './exercicio/exercicio.module';
import { ParteDoCorpoModule } from './parte-do-corpo/parte-do-corpo.module';
import { CategoriaModule } from './categoria/categoria.module';
import { TarefaModule } from './tarefas/tarefas.module';
import { EventoModule } from './evento/evento.module';
import { TransacaoFinanceiraModule } from './transacao_financeira/transacao-financeira.module';
import { EmailModule } from './email/email.module';
import { EmpresaModule } from './empresa/empresa.module';
import { TeamMemberModule } from './instructor/team-member.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { ServiceModule } from './service/service.module';
import { ConfigModule } from '@nestjs/config';
import { AutomationsModule } from './automations/automations.module';


@Module({
  imports: [
    GeminiModule,
    DashboardModule,
    FichaAlunoModule,
    ConfigModule.forRoot({ isGlobal: true }), // <-- Add this to load .env globally
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'client'),
      // serveRoot: join(__dirname, '..', 'client'),

      rootPath: join(__dirname),
      serveRoot: join(__dirname),

      renderPath: join(__dirname, '', 'index.html'),
    }),
    TipoUsuarioModule,
    AuthModule,
    UsuarioModule,
    TipoUsuarioModule,
    HorarioModule,
    PlanoModule,
    MusculoModule,
    EquipamentoModule,
    DataBaseModule,
    TreinoModule,
    ExercicioModule,
    GrupoMuscularModule,
    ParteDoCorpoModule,
    CategoriaModule,
    TarefaModule,
    EventoModule,
    TransacaoFinanceiraModule,
    EmpresaModule,
    EmailModule,
    TeamMemberModule,
    SpecialtyModule,
    ServiceModule,
    AutomationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

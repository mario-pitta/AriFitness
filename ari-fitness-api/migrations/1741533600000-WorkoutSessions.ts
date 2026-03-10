/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class WorkoutSessions1741533600000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Criar tabela treino_sessao
        await queryRunner.createTable(new Table({
            name: "treino_sessao",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "created_at",
                    type: "timestamptz",
                    default: "now()"
                },
                {
                    name: "treino_id",
                    type: "bigint"
                },
                {
                    name: "nome",
                    type: "varchar",
                    length: "10"
                },
                {
                    name: "ordem",
                    type: "smallint"
                }
            ]
        }), true);

        // 2. Criar índice em treino_sessao(treino_id)
        await queryRunner.createIndex("treino_sessao", new TableIndex({
            name: "idx_treino_sessao_treino_id",
            columnNames: ["treino_id"]
        }));

        // 3. Adicionar colunas em treino_exercicio
        await queryRunner.query(`
            ALTER TABLE "treino_exercicio" 
            ADD COLUMN "sessao_id" bigint,
            ADD COLUMN "ordem" smallint,
            ADD COLUMN "tipo_execucao" smallint DEFAULT 1,
            ADD COLUMN "grupo_execucao" smallint,
            ADD COLUMN "tipo_progressao" smallint DEFAULT 1,
            ADD COLUMN "carga_series" jsonb
        `);

        // 4. Criar tabela ficha_sessao
        await queryRunner.createTable(new Table({
            name: "ficha_sessao",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "created_at",
                    type: "timestamptz",
                    default: "now()"
                },
                {
                    name: "ficha_id",
                    type: "bigint"
                },
                {
                    name: "nome",
                    type: "varchar",
                    length: "10"
                },
                {
                    name: "ordem",
                    type: "smallint"
                }
            ]
        }), true);

        // 5. Criar tabela ficha_exercicio
        await queryRunner.createTable(new Table({
            name: "ficha_exercicio",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "created_at",
                    type: "timestamptz",
                    default: "now()"
                },
                {
                    name: "ficha_sessao_id",
                    type: "bigint"
                },
                {
                    name: "exercicio_id",
                    type: "bigint"
                },
                {
                    name: "series",
                    type: "smallint",
                    isNullable: true
                },
                {
                    name: "repeticoes",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "carga",
                    type: "numeric",
                    isNullable: true
                },
                {
                    name: "intervalo",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "ordem",
                    type: "smallint"
                },
                {
                    name: "tipo_execucao",
                    type: "smallint",
                    default: 1
                },
                {
                    name: "grupo_execucao",
                    type: "smallint",
                    isNullable: true
                },
                {
                    name: "tipo_progressao",
                    type: "smallint",
                    default: 1
                },
                {
                    name: "carga_series",
                    type: "jsonb",
                    isNullable: true
                }
            ]
        }), true);

        // 6. Adicionar Foreign Keys
        await queryRunner.createForeignKey("treino_sessao", new TableForeignKey({
            columnNames: ["treino_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "treino",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("treino_exercicio", new TableForeignKey({
            columnNames: ["sessao_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "treino_sessao",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("ficha_sessao", new TableForeignKey({
            columnNames: ["ficha_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "ficha_aluno",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ficha_exercicio", new TableForeignKey({
            columnNames: ["ficha_sessao_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "ficha_sessao",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("ficha_exercicio", new TableForeignKey({
            columnNames: ["exercicio_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "exercicios",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover Foreign Keys primeiro
        const tableFichaExercicio = await queryRunner.getTable("ficha_exercicio");
        if (tableFichaExercicio) {
            const fks = tableFichaExercicio.foreignKeys.filter(fk =>
                fk.columnNames.indexOf("ficha_sessao_id") !== -1 ||
                fk.columnNames.indexOf("exercicio_id") !== -1
            );
            await queryRunner.dropForeignKeys("ficha_exercicio", fks);
        }

        const tableFichaSessao = await queryRunner.getTable("ficha_sessao");
        if (tableFichaSessao) {
            const fks = tableFichaSessao.foreignKeys.filter(fk => fk.columnNames.indexOf("ficha_id") !== -1);
            await queryRunner.dropForeignKeys("ficha_sessao", fks);
        }

        const tableTreinoExercicio = await queryRunner.getTable("treino_exercicio");
        if (tableTreinoExercicio) {
            const fks = tableTreinoExercicio.foreignKeys.filter(fk => fk.columnNames.indexOf("sessao_id") !== -1);
            await queryRunner.dropForeignKeys("treino_exercicio", fks);
        }

        const tableTreinoSessao = await queryRunner.getTable("treino_sessao");
        if (tableTreinoSessao) {
            const fks = tableTreinoSessao.foreignKeys.filter(fk => fk.columnNames.indexOf("treino_id") !== -1);
            await queryRunner.dropForeignKeys("treino_sessao", fks);
        }

        // Remover tabelas e colunas
        await queryRunner.dropTable("ficha_exercicio");
        await queryRunner.dropTable("ficha_sessao");

        await queryRunner.query(`
            ALTER TABLE "treino_exercicio" 
            DROP COLUMN "sessao_id",
            DROP COLUMN "ordem",
            DROP COLUMN "tipo_execucao",
            DROP COLUMN "grupo_execucao",
            DROP COLUMN "tipo_progressao",
            DROP COLUMN "carga_series"
        `);

        await queryRunner.dropTable("treino_sessao");
    }

}

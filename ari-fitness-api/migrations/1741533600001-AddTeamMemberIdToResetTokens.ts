/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddTeamMemberIdToResetTokens1741533600001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Alterar user_id para ser opcional (nullable)
        await queryRunner.changeColumn("reset_tokens", "user_id", new TableColumn({
            name: "user_id",
            type: "bigint",
            isNullable: true
        }));

        // 2. Adicionar coluna team_member_id
        await queryRunner.addColumn("reset_tokens", new TableColumn({
            name: "team_member_id",
            type: "uuid",
            isNullable: true
        }));

        // 3. Adicionar Foreign Key para team_member
        await queryRunner.createForeignKey("reset_tokens", new TableForeignKey({
            columnNames: ["team_member_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "team_member",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Remover Foreign Key
        const table = await queryRunner.getTable("reset_tokens");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("team_member_id") !== -1);
            if (foreignKey) await queryRunner.dropForeignKey("reset_tokens", foreignKey);
        }

        // 2. Remover coluna team_member_id
        await queryRunner.dropColumn("reset_tokens", "team_member_id");

        // 3. Voltar user_id para NOT NULL (se era original assim)
        // Nota: Assumindo que era NOT NULL originalmente.
        await queryRunner.changeColumn("reset_tokens", "user_id", new TableColumn({
            name: "user_id",
            type: "bigint",
            isNullable: false
        }));
    }

}

/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

const env = dotenv.config({ path: '.env' });

export const typeOrmConfig: DataSourceOptions = {
    type: 'postgres',
    url: env.parsed?.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
    synchronize: false, // NEVER true in production — use migrations
    logging: process.env.NODE_ENV !== 'production',
};

/**
 * TypeORM DataSource — usado pela CLI para gerar/executar migrations.
 *
 * Como usar:
 *   npx typeorm-ts-node-commonjs migration:generate src/datasource/migrations/NomeDaMigracao -d src/datasource/database.config.ts
 *   npx typeorm-ts-node-commonjs migration:run -d src/datasource/database.config.ts
 */
export const AppDataSource = new DataSource(typeOrmConfig);

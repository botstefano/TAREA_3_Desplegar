import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: (): Pool => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error(
            'DATABASE_URL no está definida (ej: postgresql://user:pass@localhost:5432/unt_gestion)',
          );
        }
        return new Pool({ connectionString });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}

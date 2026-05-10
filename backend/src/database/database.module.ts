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
          console.warn('DATABASE_URL no está definida, usando mock para Railway');
          // Retornar un mock para que la aplicación inicie
          return null as any;
        }
        return new Pool({ connectionString });
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}

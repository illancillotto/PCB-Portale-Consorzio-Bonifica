import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnagraficheModule } from './modules/anagrafiche/anagrafiche.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatastoModule } from './modules/catasto/catasto.module';
import { CoreModule } from './modules/core/core.module';
import { GisModule } from './modules/gis/gis.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    CoreModule,
    AuthModule,
    AnagraficheModule,
    IngestModule,
    AuditModule,
    CatastoModule,
    GisModule,
    SearchModule,
  ],
})
export class AppModule {}

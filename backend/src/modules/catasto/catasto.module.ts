import { Module } from '@nestjs/common';
import { CatastoService } from './catasto.service';

@Module({
  providers: [CatastoService],
  exports: [CatastoService],
})
export class CatastoModule {}

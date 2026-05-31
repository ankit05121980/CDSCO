import { Global, Module } from '@nestjs/common';
import { ReferenceService } from './services/reference.service';

@Global()
@Module({
  providers: [ReferenceService],
  exports: [ReferenceService],
})
export class CommonModule {}

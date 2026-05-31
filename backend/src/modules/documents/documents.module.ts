import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { ESignature } from './esignature.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Document, ESignature])],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService, TypeOrmModule],
})
export class DocumentsModule {}

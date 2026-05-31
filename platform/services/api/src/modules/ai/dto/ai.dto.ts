import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SummarizeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(2000)
  maxWords?: number;
}

export class ExtractDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}

export class QaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  question: string;

  @ApiPropertyOptional({ description: 'Inline context; if omitted, RAG retrieval is used.' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topK?: number;
}

export class ProposalDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  requirements: string;
}

export class ComplianceDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiPropertyOptional({ default: 'NIST 800-53' })
  @IsOptional()
  @IsString()
  framework?: string;
}

export class IngestDto {
  @ApiProperty()
  @IsString()
  sourceType: string;

  @ApiProperty()
  @IsString()
  sourceId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SearchDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topK?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceType?: string;
}

export class ChatDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  message: string;

  @ApiPropertyOptional({ description: 'Session id for multi-turn memory.' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class AgentRunDto {
  @ApiProperty({ description: 'Agent name, e.g. research, compliance, proposal.' })
  @IsString()
  agent: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objective: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceId?: string;
}

export class PipelineStepDto {
  @ApiProperty()
  @IsString()
  agent: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objective?: string;
}

export class PipelineDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  objective: string;

  @ApiProperty({ type: [PipelineStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineStepDto)
  steps: PipelineStepDto[];
}

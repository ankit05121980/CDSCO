import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { RagService } from './rag/rag.service';
import { AgentOrchestratorService } from './agents/orchestrator.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/constants/roles';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user';
import {
  AgentRunDto,
  ChatDto,
  ComplianceDto,
  ExtractDto,
  IngestDto,
  PipelineDto,
  ProposalDto,
  QaDto,
  SearchDto,
  SummarizeDto,
} from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@RequirePermissions(Permission.AI_INVOKE)
@Controller('ai')
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly rag: RagService,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  @Post('summarize')
  @ApiOperation({ summary: 'Summarize arbitrary content (documents, contracts, policies).' })
  summarize(@CurrentUser() user: AuthenticatedUser, @Body() dto: SummarizeDto) {
    return this.ai.summarize(user, dto.content, dto.maxWords);
  }

  @Post('entities')
  @ApiOperation({ summary: 'Extract named entities from content.' })
  entities(@CurrentUser() user: AuthenticatedUser, @Body() dto: ExtractDto) {
    return this.ai.extractEntities(user, dto.content);
  }

  @Post('keywords')
  @ApiOperation({ summary: 'Extract keywords/topics from content.' })
  keywords(@CurrentUser() user: AuthenticatedUser, @Body() dto: ExtractDto) {
    return this.ai.extractKeywords(user, dto.content);
  }

  @Post('risk')
  @ApiOperation({ summary: 'Detect risk signals (contract/policy review).' })
  risk(@CurrentUser() user: AuthenticatedUser, @Body() dto: ExtractDto) {
    return this.ai.detectRisks(user, dto.content);
  }

  @Post('compliance')
  @ApiOperation({ summary: 'Compliance gap analysis against a control framework.' })
  compliance(@CurrentUser() user: AuthenticatedUser, @Body() dto: ComplianceDto) {
    return this.ai.complianceGap(user, dto.content, dto.framework);
  }

  @Post('proposal')
  @ApiOperation({ summary: 'Generate an RFP/RFI proposal from requirements.' })
  proposal(@CurrentUser() user: AuthenticatedUser, @Body() dto: ProposalDto) {
    return this.ai.proposal(user, dto.requirements);
  }

  @Post('qa')
  @ApiOperation({ summary: 'Question answering (RAG-grounded if no context supplied).' })
  qa(@CurrentUser() user: AuthenticatedUser, @Body() dto: QaDto) {
    return this.ai.qa(user, dto.question, dto.context, dto.topK);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Conversational enterprise assistant with memory + RAG.' })
  chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChatDto) {
    return this.ai.chat(user, dto.message, dto.sessionId);
  }

  @Post('rag/ingest')
  @ApiOperation({ summary: 'Ingest text into the tenant vector index.' })
  ingest(@CurrentUser() user: AuthenticatedUser, @Body() dto: IngestDto) {
    return this.rag.ingest({
      tenantId: user.tenantId,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
      text: dto.text,
      metadata: dto.metadata,
    });
  }

  @Post('rag/search')
  @ApiOperation({ summary: 'Semantic + lexical hybrid search over the vector index.' })
  search(@CurrentUser() user: AuthenticatedUser, @Body() dto: SearchDto) {
    return this.rag.retrieve({
      tenantId: user.tenantId,
      query: dto.query,
      topK: dto.topK,
      sourceType: dto.sourceType,
    });
  }

  @Get('agents')
  @ApiOperation({ summary: 'List available AI agents.' })
  agents() {
    return this.orchestrator.list();
  }

  @Post('agents/run')
  @ApiOperation({ summary: 'Run a single specialized agent.' })
  runAgent(@CurrentUser() user: AuthenticatedUser, @Body() dto: AgentRunDto) {
    return this.orchestrator.runAgent(dto.agent, {
      tenantId: user.tenantId,
      userId: user.userId,
      objective: dto.objective,
      sourceType: dto.sourceType,
      sourceId: dto.sourceId,
    });
  }

  @Post('agents/pipeline')
  @ApiOperation({ summary: 'Run a multi-agent sequential pipeline with shared memory.' })
  pipeline(@CurrentUser() user: AuthenticatedUser, @Body() dto: PipelineDto) {
    return this.orchestrator.runPipeline(
      { tenantId: user.tenantId, userId: user.userId, objective: dto.objective },
      dto.steps,
    );
  }
}

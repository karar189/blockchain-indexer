import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { CreateIndexerDto } from './dto/create-indexer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('indexer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @ApiOperation({ summary: 'Create a new indexer' })
  @ApiResponse({ status: 201, description: 'Indexer successfully created' })
  @Post()
  create(@Body() createIndexerDto: CreateIndexerDto, @Req() req) {
    return this.indexerService.create(createIndexerDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all indexers' })
  @ApiResponse({ status: 200, description: 'Return all indexers' })
  @Get()
  findAll(@Req() req) {
    return this.indexerService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'Get a specific indexer' })
  @ApiResponse({ status: 200, description: 'Return the indexer details' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.indexerService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update an indexer' })
  @ApiResponse({ status: 200, description: 'Indexer successfully updated' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndexerDto: CreateIndexerDto, @Req() req) {
    return this.indexerService.update(id, updateIndexerDto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete an indexer' })
  @ApiResponse({ status: 200, description: 'Indexer successfully deleted' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.indexerService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Activate an indexer' })
  @ApiResponse({ status: 200, description: 'Indexer successfully activated' })
  @Post(':id/activate')
  activate(@Param('id') id: string, @Req() req) {
    return this.indexerService.activate(id, req.user.id);
  }

  @ApiOperation({ summary: 'Deactivate an indexer' })
  @ApiResponse({ status: 200, description: 'Indexer successfully deactivated' })
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string, @Req() req) {
    return this.indexerService.deactivate(id, req.user.id);
  }
}
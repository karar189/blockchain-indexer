import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('database')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @ApiOperation({ summary: 'Create a new database connection' })
  @ApiResponse({ status: 201, description: 'Connection successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request (connection failed)' })
  @Post()
  create(@Body() createConnectionDto: CreateConnectionDto, @Req() req) {
    return this.databaseService.create(createConnectionDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get all database connections' })
  @ApiResponse({ status: 200, description: 'Return all connections' })
  @Get()
  findAll(@Req() req) {
    return this.databaseService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'Get a specific database connection' })
  @ApiResponse({ status: 200, description: 'Return the connection details' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.databaseService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Update a database connection' })
  @ApiResponse({ status: 200, description: 'Connection successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request (connection failed)' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConnectionDto: CreateConnectionDto, @Req() req) {
    return this.databaseService.update(id, updateConnectionDto, req.user.id);
  }

  @ApiOperation({ summary: 'Delete a database connection' })
  @ApiResponse({ status: 200, description: 'Connection successfully deleted' })
  @ApiResponse({ status: 404, description: 'Connection not found' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.databaseService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: 'Test a database connection without saving' })
  @ApiResponse({ status: 200, description: 'Connection test successful' })
  @ApiResponse({ status: 400, description: 'Connection test failed' })
  @Post('test')
  testConnection(@Body() connectionDetails: CreateConnectionDto) {
    return this.databaseService.testConnection(connectionDetails);
  }
}
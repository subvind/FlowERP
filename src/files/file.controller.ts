import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';

import { FileService } from './file.service';
import { OrganizationService } from '../organizations/organization.service';
import { CategoryService } from '../categories/category.service';

import { File } from './file.entity';
import { NotFoundException } from '@nestjs/common'; // Import the NotFoundException

import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly categoryService: CategoryService,
    private readonly organizationService: OrganizationService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { data, total } = await this.fileService.findAll(page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Get a file by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<File> {
    return this.fileService.findOne(id);
  }

  @ApiOperation({ summary: 'Get a file by SKU' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('filename/:filename/:organizationId')
  async findSingle(@Param('filename') filename: string, @Param('organizationId') organizationId: string): Promise<File> {
    return this.fileService.findByFilename(filename, organizationId);
  }

  @ApiOperation({ summary: 'Create a file' })
  @ApiBody({ type: File })
  @ApiResponse({ status: 201, description: 'Success', type: File })
  @Post()
  async create(@Body() fileData: File): Promise<File> {
    return this.fileService.create(fileData);
  }

  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedFileData: File): Promise<File> {
    return this.fileService.update(id, updatedFileData);
  }

  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.fileService.remove(id);
  }

  @ApiOperation({ summary: 'Find files related to an organization' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('orgRelated/:id')
  async findOrgFile(
    @Param('id') organizationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<any> {
    const organization = await this.organizationService.findOne(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const { data, total } = await this.fileService.findOrgFile(organization, page, limit, search);
    return { data, total };
  }

  @ApiOperation({ summary: 'Find files related to a category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('categoryRelated/:id')
  async findCategoryFile(
    @Param('id') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ): Promise<any> {
    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { data, total } = await this.fileService.findCategoryFile(category, page, limit, search, type);
    return { data, total };
  }
}

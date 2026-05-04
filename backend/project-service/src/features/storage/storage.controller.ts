import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Get, 
  Param,
  BadRequestException,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file locally' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileKey = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    await this.storageService.uploadFile(
      fileKey, 
      file.buffer, 
      file.mimetype
    );

    return {
      message: 'File uploaded successfully',
      key: fileKey,
      url: await this.storageService.getPresignedUrl(fileKey),
    };
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get file URL' })
  async getFileUrl(@Param('key') key: string) {
    const url = await this.storageService.getPresignedUrl(key);
    return { url };
  }
}

import { Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body, Res, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from '../service/documents.service';
import { JwtAuthGuard } from '../../../middleware/guards/jwt-auth.guard';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get()
    @ApiOperation({ summary: 'Récupérer tous les documents généraux' })
    findAll() {
        return this.documentsService.findAll();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Uploader un nouveau document' })
    upload(@UploadedFile() file: any, @Body() uploadDto: UploadDocumentDto, @Request() req: any) {
        return this.documentsService.upload(file, uploadDto, req.user);
    }

    @Get(':id/download')
    @ApiOperation({ summary: 'Télécharger un document' })
    download(@Param('id') id: string, @Res() res: any) {
        return this.documentsService.download(id, res);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un document' })
    remove(@Param('id') id: string) {
        return this.documentsService.remove(id);
    }
}

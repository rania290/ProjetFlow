import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../model/document.entity';
import { FileService } from '../../../utils/services/file.service';
import { UploadDocumentDto } from '../dto/upload-document.dto';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly fileService: FileService,
    ) { }

    async findAll() {
        return this.documentRepository.find({ order: { uploadedAt: 'DESC' } });
    }

    async upload(file: any, uploadDto: UploadDocumentDto, user: any) {
        if (!file) {
            throw new Error('Fichier requis');
        }

        const filename = await this.fileService.saveFile(file, 'general');

        const document = this.documentRepository.create({
            name: file.originalname,
            type: this.getFileType(file.originalname),
            size: this.formatBytes(file.size),
            author: user?.fullName || 'Utilisateur',
            category: uploadDto.category || 'Général',
            projectId: uploadDto.projectId,
            projectName: uploadDto.projectName,
            url: `general/${filename}`,
        });

        return this.documentRepository.save(document);
    }

    async download(id: string, res: any) {
        const document = await this.documentRepository.findOne({ where: { id } });
        if (!document) throw new NotFoundException('Document non trouvé');

        const buffer = await this.fileService.getFile(document.url);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${document.name}`);
        res.send(buffer);
    }

    async remove(id: string) {
        const document = await this.documentRepository.findOne({ where: { id } });
        if (!document) throw new NotFoundException('Document non trouvé');

        try {
            await this.fileService.deleteFile(document.url);
        } catch (error) {
            console.error('Erreur lors de la suppression physique du fichier:', error);
        }

        await this.documentRepository.remove(document);
    }

    private getFileType(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['zip', 'rar', '7z'].includes(ext || '')) return 'zip';
        if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'html', 'css', 'md'].includes(ext || '')) return 'code';
        return 'file';
    }

    private formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

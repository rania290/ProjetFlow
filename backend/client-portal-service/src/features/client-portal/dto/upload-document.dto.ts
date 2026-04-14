import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
    @ApiProperty({ description: 'ID du projet lié', required: false })
    @IsOptional()
    @IsString()
    projectId?: string;

    @ApiProperty({ description: 'Nom du projet lié', required: false })
    @IsOptional()
    @IsString()
    projectName?: string;

    @ApiProperty({ description: 'Catégorie du document', required: false })
    @IsOptional()
    @IsString()
    category?: string;
}

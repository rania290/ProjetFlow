import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ReportingParamsDto {
    @IsOptional()
    @IsString()
    dateFrom?: string;

    @IsOptional()
    @IsString()
    dateTo?: string;

    @IsOptional()
    @IsUUID()
    clientId?: string;
}

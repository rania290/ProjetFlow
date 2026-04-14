import { IsString, IsNotEmpty, IsOptional, IsUUID, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyToDto {
  @IsString()
  id: string;

  @IsString()
  authorName: string;

  @IsString()
  content: string;
}

export class CreateChatMessageDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsOptional()
  mentions?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  threadId?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ReplyToDto)
  replyTo?: ReplyToDto;
}

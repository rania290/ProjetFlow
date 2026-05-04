import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadPath = path.resolve(process.cwd(), 'uploads');

  async onModuleInit() {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      this.logger.log(`Directory "${this.uploadPath}" created successfully.`);
    }
  }

  async uploadFile(key: string, body: Buffer, contentType?: string): Promise<string> {
    try {
      const filePath = path.join(this.uploadPath, key);
      fs.writeFileSync(filePath, body);
      this.logger.log(`File "${key}" uploaded locally.`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file "${key}" locally:`, error);
      throw error;
    }
  }

  async getPresignedUrl(key: string): Promise<string> {
    // For local storage, we return a direct URL path
    // The Gateway or Project Service must serve the 'uploads' folder
    return `/api/storage/files/${key}`;
  }
}

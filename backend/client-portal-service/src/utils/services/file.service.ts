import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}

  async saveFile(file: MulterFile, directory: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', directory);
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '') + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
    
    const filePath = path.join(uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(filename);
        }
      });
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', filePath);
    
    return new Promise((resolve, reject) => {
      fs.unlink(fullPath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', filePath);
    
    return new Promise((resolve, reject) => {
      fs.readFile(fullPath, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', filePath);
    
    return new Promise((resolve) => {
      fs.access(fullPath, fs.constants.F_OK, (error) => {
        resolve(!error);
      });
    });
  }

  validateFileType(file: MulterFile): boolean {
    const allowedTypes = (this.configService.get('ALLOWED_FILE_TYPES') || 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx').split(',');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    return allowedTypes.includes(fileExtension || '');
  }

  validateFileSize(file: MulterFile): boolean {
    const maxSize = parseInt(this.configService.get('MAX_FILE_SIZE') || '10485760'); // 10MB par défaut
    return file.size <= maxSize;
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async getFileInfo(filePath: string): Promise<{
    size: number;
    createdAt: Date;
    modifiedAt: Date;
  }> {
    const fullPath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', filePath);
    
    return new Promise((resolve, reject) => {
      fs.stat(fullPath, (error, stats) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          });
        }
      });
    });
  }

  async createDirectory(directory: string): Promise<void> {
    const uploadDir = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', directory);
    
    return new Promise((resolve, reject) => {
      fs.mkdir(uploadDir, { recursive: true }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async listFiles(directory: string): Promise<string[]> {
    const uploadDir = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', directory);
    
    return new Promise((resolve, reject) => {
      fs.readdir(uploadDir, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }

  async copyFile(source: string, destination: string): Promise<void> {
    const sourcePath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', source);
    const destPath = path.join(process.cwd(), this.configService.get('UPLOAD_DIR') || 'uploads', destination);
    
    return new Promise((resolve, reject) => {
      fs.copyFile(sourcePath, destPath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Request {
  method: string;
  url: string;
  headers: any;
  [key: string]: any;
}

interface Response {
  send: (data?: any) => void;
  statusCode: number;
}

interface NextFunction {
  (err?: any): void;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Logger les informations de la requête
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    // Logger les headers importants
    const importantHeaders = ['user-agent', 'authorization', 'x-forwarded-for'];
    importantHeaders.forEach(header => {
      if (req.headers[header]) {
        console.log(`[${timestamp}] ${header}: ${req.headers[header]}`);
      }
    });

    // Logger le corps de la requête (uniquement en développement)
    if (this.configService.get('NODE_ENV') === 'development') {
      console.log(`[${timestamp}] Request body:`, req.body);
    }

    // Middleware pour capturer la réponse
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] Response sent in ${duration}ms`);
      console.log(`[${timestamp}] Response status: ${res.statusCode}`);
      
      originalSend.call(this, data);
    };

    next();
  }
}

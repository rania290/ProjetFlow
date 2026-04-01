import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Request {
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
  socket?: {
    remoteAddress?: string;
  };
  headers: any;
  [key: string]: any;
}

interface Response {
  setHeader: (name: string, value: string) => void;
}

interface NextFunction {
  (err?: any): void;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};

  constructor(private readonly configService: ConfigService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const windowMs = parseInt(this.configService.get('RATE_LIMIT_WINDOW_MS') || '900000'); // 15 minutes par défaut
    const maxRequests = parseInt(this.configService.get('RATE_LIMIT_MAX_REQUESTS') || '100');

    const key = this.getClientKey(req);
    const now = Date.now();

    // Initialiser ou réinitialiser le compteur
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      this.store[key].count++;
    }

    // Vérifier si la limite est dépassée
    if (this.store[key].count > maxRequests) {
      const resetIn = Math.ceil((this.store[key].resetTime - now) / 1000);

      throw new HttpException({
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${String(resetIn)} seconds.`,
        retryAfter: resetIn
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    // Ajouter les headers de rate limiting
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - this.store[key].count)));
    res.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    next();
  }

  private getClientKey(req: Request): string {
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    // Utiliser l'IP et le user agent pour créer une clé unique
    return `${ip}-${userAgent}`;
  }

  // Nettoyer les anciennes entrées périodiquement
  private cleanup(): void {
    const now = Date.now();
    const windowMs = parseInt(this.configService.get('RATE_LIMIT_WINDOW_MS') || '900000');

    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime + windowMs) {
        delete this.store[key];
      }
    });
  }
}

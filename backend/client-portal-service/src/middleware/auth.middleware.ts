import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Vérification d'authentification basique
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Si pas d'en-tête d'autorisation, continuer quand même
      // La vérification finale sera faite par les guards
      return next();
    }

    // Ajouter les informations utilisateur à la requête si disponible
    // La vérification JWT réelle sera faite par JwtAuthGuard
    next();
  }
}

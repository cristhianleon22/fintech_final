import { Request, Response, NextFunction } from 'express';
import { JwtTokenService, TokenPayload } from '../../infrastructure/services/JwtTokenService';

export interface AuthenticatedRequest extends Request {
    user?: TokenPayload;
}

export class AuthMiddleware {
    constructor(private readonly tokenService: JwtTokenService) { }

    handle = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                status: 'error',
                message: 'Token de autenticación no proporcionado o formato inválido (debe ser Bearer <token>).',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = this.tokenService.verifyToken(token);
            req.user = decoded;
            next();
        } catch {
            res.status(401).json({
                status: 'error',
                message: 'Token de autenticación inválido o expirado.',
            });
        }
    };
}


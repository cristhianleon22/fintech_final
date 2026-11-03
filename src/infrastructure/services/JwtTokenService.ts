import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    email: string;
}

export class JwtTokenService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'fintech_secret_key_change_in_production';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
    }

    verifyToken(token: string): TokenPayload {
        return jwt.verify(token, this.secret) as TokenPayload;
    }
}


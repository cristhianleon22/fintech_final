import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
    constructor(private readonly saltRounds: number = 10) { }

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }
}


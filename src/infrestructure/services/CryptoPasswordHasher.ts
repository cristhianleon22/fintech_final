import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { PasswordHasher } from "../../domain/services/PasswordHasher";

const scryptAsync = promisify(scrypt);

export class CryptoPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        const salt = randomBytes(16).toString("hex");
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString("hex")}`;
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        const [salt, key] = hashed.split(":");
        if (!salt || !key) {
            return false;
        }

        const derivedKey = (await scryptAsync(plain, salt, 64)) as Buffer;
        const keyBuffer = Buffer.from(key, "hex");

        if (derivedKey.length !== keyBuffer.length) {
            return false;
        }

        return timingSafeEqual(derivedKey, keyBuffer);
    }
}


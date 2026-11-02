import { User as PrismaUser, Prisma } from '../../generated/prisma/client';
import { User } from '../../domain/entities/User';

export class UserMapper {
    /**
     * Convierte un registro de infraestructura (Prisma) a una entidad de dominio puro
     */
    public static toDomain(prismaUser: PrismaUser): User {
        return User.reconstitute({
            id: prismaUser.id,
            email: prismaUser.email,
            password: prismaUser.passwordHash,
            fullName: prismaUser.fullName,
            status: prismaUser.status,
            createdAt: prismaUser.createdAt
        });
    }

    /**
     * Convierte una entidad de dominio a la estructura requerida por Prisma para persistencia
     */
    public static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
        return {
            id: user.id || undefined,
            email: user.email,
            passwordHash: user.password,
            fullName: user.fullName,
            status: user.status,
            createdAt: user.createdAt
        };
    }
}


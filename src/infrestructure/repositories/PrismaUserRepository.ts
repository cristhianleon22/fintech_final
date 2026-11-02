import { PrismaClient } from '../../generated/prisma/client';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements UserRepository {
    // Inyección de dependencias a través del constructor
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Guarda un nuevo usuario en la base de datos
     */
    async save(user: User): Promise<void> {
        const data = UserMapper.toPersistence(user);
        await this.prisma.user.create({ data });
    }

    /**
     * Actualiza el estado, nombre o credenciales de un usuario existente
     */
    async update(user: User): Promise<void> {
        const data = UserMapper.toPersistence(user);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                fullName: data.fullName,
                status: data.status,
                passwordHash: data.passwordHash,
            },
        });
    }

    /**
     * Busca un usuario por su identificador único (UUID)
     */
    async findById(id: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!prismaUser) return null;
        return UserMapper.toDomain(prismaUser);
    }

    /**
     * Busca un usuario por su correo electrónico único
     */
    async findByEmail(email: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!prismaUser) return null;
        return UserMapper.toDomain(prismaUser);
    }
}


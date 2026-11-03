import { PrismaClient } from '../../generated/prisma/client';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaTransactionRepository implements TransactionRepository {
    // Inyección de dependencias a través del constructor
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Guarda una transacción (depósito, retiro o transferencia) en la base de datos
     */
    async save(transaction: Transaction): Promise<void> {
        const data = TransactionMapper.toPersistence(transaction);
        await this.prisma.transaction.create({ data });
    }

    /**
     * Busca una transacción por su identificador único (UUID)
     */
    async findById(id: string): Promise<Transaction | null> {
        const prismaTx = await this.prisma.transaction.findUnique({
            where: { id },
        });

        if (!prismaTx) return null;
        return TransactionMapper.toDomain(prismaTx);
    }

    /**
     * Obtiene el historial de transacciones donde la cuenta participa como origen o destino
     */
    async findByAccountId(accountId: string): Promise<Transaction[]> {
        const prismaTxs = await this.prisma.transaction.findMany({
            where: {
                OR: [
                    { sourceAccountId: accountId },
                    { destinationAccountId: accountId },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return prismaTxs.map((tx) => TransactionMapper.toDomain(tx));
    }
}


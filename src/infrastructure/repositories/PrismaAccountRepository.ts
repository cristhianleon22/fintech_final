import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/AccountRepository';
import { Account } from '../../domain/entities/Account';
import { Transaction, Deposit, Withdrawal, Transfer } from '../../domain/entities/Transaction';
import { AccountMapper } from '../mappers/AccountMapper';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaAccountRepository implements AccountRepository {
    // Inyección de dependencias a través del constructor
    constructor(private readonly prisma: PrismaClient) { }

    /**
     * Guarda una nueva cuenta en la base de datos
     */
    async save(account: Account): Promise<void> {
        const data = AccountMapper.toPersistence(account);
        await this.prisma.account.create({ data });
    }

    /**
     * Actualiza el estado y balance de una cuenta existente
     */
    async update(account: Account): Promise<void> {
        const data = AccountMapper.toPersistence(account);
        await this.prisma.account.update({
            where: { id: account.id },
            data: {
                balance: data.balance,
                status: data.status,
            },
        });
    }

    /**
     * Busca una cuenta por su identificador único (UUID)
     */
    async findById(id: string): Promise<Account | null> {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { id },
        });

        if (!prismaAccount) return null;
        return AccountMapper.toDomain(prismaAccount);
    }

    /**
     * Busca una cuenta por su número de cuenta
     */
    async findByAccountNumber(accountNumber: string): Promise<Account | null> {
        const prismaAccount = await this.prisma.account.findUnique({
            where: { accountNumber },
        });

        if (!prismaAccount) return null;
        return AccountMapper.toDomain(prismaAccount);
    }

    /**
     * Obtiene todas las cuentas asociadas a un usuario
     */
    async findByUserId(userId: string): Promise<Account[]> {
        const prismaAccounts = await this.prisma.account.findMany({
            where: { userId },
        });

        return prismaAccounts.map((acc) => AccountMapper.toDomain(acc));

    }

    /**
     * Ejecuta de forma atómica cualquier transacción financiera (TRANSFER, DEPOSIT, WITHDRAWAL)
     * actualizando saldos y persistiendo la entidad de dominio Transaction.
     */
    async executeTransaction(transaction: Transaction): Promise<Transaction> {
        return await this.prisma.$transaction(async (tx) => {
            if (transaction instanceof Transfer) {
                // Descontar saldo de la cuenta origen
                await tx.account.update({
                    where: { id: transaction.sourceAccount },
                    data: {
                        balance: { decrement: transaction.amount },
                    },
                });

                // Aumentar saldo en la cuenta destino
                await tx.account.update({
                    where: { id: transaction.destinationAccount },
                    data: {
                        balance: { increment: transaction.amount },
                    },
                });
            } else if (transaction instanceof Withdrawal) {
                // Descontar saldo de la cuenta origen
                await tx.account.update({
                    where: { id: transaction.sourceAccount },
                    data: {
                        balance: { decrement: transaction.amount },
                    },
                });
            } else if (transaction instanceof Deposit) {
                // Aumentar saldo en la cuenta destino
                await tx.account.update({
                    where: { id: transaction.destinationAccount },
                    data: {
                        balance: { increment: transaction.amount },
                    },
                });
            }

            // Persistir la transacción
            const data = TransactionMapper.toPersistence(transaction);
            const prismaTx = await tx.transaction.create({ data });

            return TransactionMapper.toDomain(prismaTx);
        });
    }
}

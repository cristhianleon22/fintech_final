import { Account } from "../entities/Account";
import { Transaction } from "../entities/Transaction";

export interface AccountRepository {
    findById(id: string): Promise<Account | null>;
    findByAccountNumber(accountNumber: string): Promise<Account | null>;
    findByUserId(userId: string): Promise<Account[]>;
    save(account: Account): Promise<void>;
    update(account: Account): Promise<void>;
    /**
     * Ejecuta de forma atómica cualquier transacción financiera (TRANSFER, DEPOSIT, WITHDRAWAL)
     * actualizando saldos y persistiendo la entidad de dominio Transaction.
     */
    executeTransaction(transaction: Transaction): Promise<Transaction>;
}

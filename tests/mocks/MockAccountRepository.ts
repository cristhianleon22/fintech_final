import { AccountRepository } from "../../src/domain/repositories/AccountRepository";
import { Account } from "../../src/domain/entities/Account";
import { Transaction } from "../../src/domain/entities/Transaction";

export class MockAccountRepository implements AccountRepository {
    public accounts: Map<string, Account> = new Map();

    async findById(id: string): Promise<Account | null> {
        return this.accounts.get(id) ?? null;
    }

    async findByAccountNumber(accountNumber: string): Promise<Account | null> {
        for (const account of this.accounts.values()) {
            if (account.accountNumber === accountNumber) {
                return account;
            }
        }
        return null;
    }

    async findByUserId(userId: string): Promise<Account[]> {
        const result: Account[] = [];
        for (const account of this.accounts.values()) {
            if (account.userId === userId) {
                result.push(account);
            }
        }
        return result;
    }

    async save(account: Account): Promise<void> {
        this.accounts.set(account.id, account);
    }

    async update(account: Account): Promise<void> {
        this.accounts.set(account.id, account);
    }

    async executeTransaction(transaction: Transaction): Promise<Transaction> {
        return transaction;
    }
}


import { TransactionRepository } from "../domain/repositories/TransactionRepository";
import { Transaction } from "../domain/entities/Transaction";

export class GetTransactionHistoryUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) { }

    async execute(accountId: string): Promise<Transaction[]> {
        return await this.transactionRepository.findByAccountId(accountId);
    }
}


import { AccountRepository } from "../domain/repositories/AccountRepository";
import { AccountOutputDTO } from "./dto/AccountDTOs";

export class GetUserAccountsUseCase {
    constructor(private readonly accountRepository: AccountRepository) { }

    async execute(userId: string): Promise<AccountOutputDTO[]> {
        const accounts = await this.accountRepository.findByUserId(userId);

        return accounts.map((account) => ({
            id: account.id,
            accountNumber: account.accountNumber,
            balance: account.balance,
            status: account.status,
            userId: account.userId,
            createdAt: account.createdAt,
        }));
    }
}


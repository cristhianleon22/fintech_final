import { AccountRepository } from "../domain/repositories/AccountRepository";
import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { FreezeAccountInputDTO, AccountStatusOutputDTO } from "./dto/AccountStatusDTOs";

export class FreezeAccountUseCase {
    constructor(private readonly accountRepository: AccountRepository) { }

    async execute(input: FreezeAccountInputDTO): Promise<AccountStatusOutputDTO> {
        const { accountId } = input;

        // Buscar la cuenta
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        // Ejecutar el método de dominio (valida si ya está congelada y cambia a FROZEN)
        account.freeze();

        // Persistir el cambio de estado
        await this.accountRepository.update(account);

        return {
            accountId: account.id,
            accountNumber: account.accountNumber,
            status: account.status,
        };
    }
}


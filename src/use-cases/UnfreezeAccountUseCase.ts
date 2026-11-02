import { AccountRepository } from "../domain/repositories/AccountRepository";
import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { UnfreezeAccountInputDTO, AccountStatusOutputDTO } from "./dto/AccountStatusDTOs";

export class UnfreezeAccountUseCase {
    constructor(private readonly accountRepository: AccountRepository) { }

    async execute(input: UnfreezeAccountInputDTO): Promise<AccountStatusOutputDTO> {
        const { accountId } = input;

        // Buscar la cuenta
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        // Ejecutar el método de dominio (valida si ya está activa y cambia a ACTIVE)
        account.unfreeze();

        // Persistir el cambio de estado
        await this.accountRepository.update(account);

        return {
            accountId: account.id,
            accountNumber: account.accountNumber,
            status: account.status,
        };
    }
}


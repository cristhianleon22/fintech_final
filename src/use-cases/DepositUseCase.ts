import { Decimal } from "decimal.js";
import { AccountRepository } from "../domain/repositories/AccountRepository";
import { AccountNotFoundError, AccountFrozenError, InvalidAmountError } from "../domain/exceptions/FinancialError";
import { DepositInputDTO, DepositOutputDTO } from "./dto/DepositDTOs";

export class DepositUseCase {
    constructor(private readonly accountRepository: AccountRepository) { }

    async execute(input: DepositInputDTO): Promise<DepositOutputDTO> {
        const { accountId, amount } = input;

        // Validar que el monto sea estrictamente mayor a cero
        if (amount <= 0) {
            throw new InvalidAmountError("El monto del depósito debe ser estrictamente mayor a cero.");
        }

        // Buscar la cuenta
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        // Validar que la cuenta no se encuentre congelada
        if (account.isFrozen()) {
            throw new AccountFrozenError(accountId);
        }

        const depositAmount = new Decimal(amount);

        // Aplicar el crédito a través del método de la entidad de dominio
        account.deposit(depositAmount);

        // Persistir el cambio de saldo
        await this.accountRepository.update(account);

        return {
            accountId: account.id,
            accountNumber: account.accountNumber,
            newBalance: account.balance,
            status: account.status,
        };
    }
}


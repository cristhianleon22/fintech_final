import { Decimal } from "decimal.js";
import { AccountRepository } from "../domain/repositories/AccountRepository";
import {
    AccountNotFoundError,
    AccountFrozenError,
    InsufficientBalanceError,
    InvalidAmountError,
} from "../domain/exceptions/FinancialError";
import { WithdrawalInputDTO, WithdrawalOutputDTO } from "./dto/WithdrawalDTOs";

export class WithdrawalUseCase {
    constructor(private readonly accountRepository: AccountRepository) { }

    async execute(input: WithdrawalInputDTO): Promise<WithdrawalOutputDTO> {
        const { accountId, amount } = input;

        // Validar que el monto sea estrictamente mayor a cero
        if (amount <= 0) {
            throw new InvalidAmountError("El monto del retiro debe ser estrictamente mayor a cero.");
        }

        // Buscar la cuenta
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        // Validar que la cuenta esté activa (no congelada)
        if (account.isFrozen()) {
            throw new AccountFrozenError(accountId);
        }

        const withdrawalAmount = new Decimal(amount);

        // Validar que el saldo disponible sea suficiente (B >= amount)
        if (account.balance.lessThan(withdrawalAmount)) {
            throw new InsufficientBalanceError(accountId);
        }

        // Aplicar el débito a través del método de la entidad de dominio
        account.withdraw(withdrawalAmount);

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


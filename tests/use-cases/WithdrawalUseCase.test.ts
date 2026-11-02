import { describe, it, expect, beforeEach } from "vitest";
import { WithdrawalUseCase } from "../../src/use-cases/WithdrawalUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import {
    InsufficientBalanceError,
    AccountFrozenError,
} from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("WithdrawalUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: WithdrawalUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new WithdrawalUseCase(accountRepository);
    });

    it("Escenario 1: Retiro Exitoso decrementa el saldo correctamente", async () => {
        const account = Account.create({
            id: "acc-with-1",
            accountNumber: "ACC-777888",
            balance: new Decimal(1000.0),
            userId: "usr-10",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        const result = await useCase.execute({
            accountId: "acc-with-1",
            amount: 400.0,
        });

        expect(result).toBeDefined();
        expect(result.accountId).toBe("acc-with-1");
        expect(result.newBalance.equals(new Decimal(600.0))).toBe(true);

        const updated = await accountRepository.findById("acc-with-1");
        expect(updated!.balance.equals(new Decimal(600.0))).toBe(true);
    });

    it("Escenario 2: Error por Saldo Insuficiente cuando B < amount", async () => {
        const account = Account.create({
            id: "acc-with-2",
            accountNumber: "ACC-999000",
            balance: new Decimal(150.0),
            userId: "usr-20",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        await expect(
            useCase.execute({ accountId: "acc-with-2", amount: 500.0 })
        ).rejects.toThrow(InsufficientBalanceError);

        // El saldo no debe haber cambiado
        const updated = await accountRepository.findById("acc-with-2");
        expect(updated!.balance.equals(new Decimal(150.0))).toBe(true);
    });

    it("Escenario 3: Error al intentar retirar de una Cuenta Congelada", async () => {
        const frozenAccount = Account.create({
            id: "acc-with-frozen",
            accountNumber: "ACC-121212",
            balance: new Decimal(1000.0),
            userId: "usr-30",
            status: "FROZEN",
            createdAt: new Date(),
        });
        await accountRepository.save(frozenAccount);

        await expect(
            useCase.execute({ accountId: "acc-with-frozen", amount: 100.0 })
        ).rejects.toThrow(AccountFrozenError);
    });
});


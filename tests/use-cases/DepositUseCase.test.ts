import { describe, it, expect, beforeEach } from "vitest";
import { DepositUseCase } from "../../src/use-cases/DepositUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import {
    AccountNotFoundError,
    AccountFrozenError,
    InvalidAmountError,
} from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("DepositUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: DepositUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new DepositUseCase(accountRepository);
    });

    it("Escenario 1: Depósito Exitoso incrementa el saldo correctamente", async () => {
        const account = Account.create({
            id: "acc-active-1",
            accountNumber: "ACC-111222",
            balance: new Decimal(200.0),
            userId: "usr-01",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        const result = await useCase.execute({
            accountId: "acc-active-1",
            amount: 350.5,
        });

        expect(result).toBeDefined();
        expect(result.accountId).toBe("acc-active-1");
        expect(result.newBalance.equals(new Decimal(550.5))).toBe(true);

        const updated = await accountRepository.findById("acc-active-1");
        expect(updated!.balance.equals(new Decimal(550.5))).toBe(true);
    });

    it("Escenario 2: Error al intentar depositar un Monto Negativo o cero", async () => {
        const account = Account.create({
            id: "acc-active-2",
            accountNumber: "ACC-333444",
            balance: new Decimal(100.0),
            userId: "usr-02",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        await expect(
            useCase.execute({ accountId: "acc-active-2", amount: -50.0 })
        ).rejects.toThrow(InvalidAmountError);

        await expect(
            useCase.execute({ accountId: "acc-active-2", amount: 0 })
        ).rejects.toThrow(InvalidAmountError);
    });

    it("Escenario 3: Error cuando la Cuenta No Existe", async () => {
        await expect(
            useCase.execute({ accountId: "acc-unknown", amount: 100.0 })
        ).rejects.toThrow(AccountNotFoundError);
    });

    it("Escenario 4: Error al intentar depositar en una Cuenta Congelada", async () => {
        const frozenAccount = Account.create({
            id: "acc-frozen-1",
            accountNumber: "ACC-555666",
            balance: new Decimal(500.0),
            userId: "usr-03",
            status: "FROZEN",
            createdAt: new Date(),
        });
        await accountRepository.save(frozenAccount);

        await expect(
            useCase.execute({ accountId: "acc-frozen-1", amount: 100.0 })
        ).rejects.toThrow(AccountFrozenError);
    });
});


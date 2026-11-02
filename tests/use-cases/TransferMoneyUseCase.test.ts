import { describe, it, expect, beforeEach } from "vitest";
import { TransferMoneyUseCase } from "../../src/use-cases/TransferMoneyUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import {
    InsufficientBalanceError,
    AccountFrozenError,
    InvalidAmountError,
    AccountNotFoundError,
} from "../../src/domain/exceptions/FinancialError";
import { InvalidPropValueError } from "../../src/domain/exceptions/DomainError";
import { Decimal } from "decimal.js";

describe("TransferMoneyUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: TransferMoneyUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new TransferMoneyUseCase(accountRepository);
    });

    it("Transferencia exitosa entre dos cuentas activas con saldo suficiente", async () => {
        const source = Account.create({
            id: "src-1",
            accountNumber: "ACC-SRC-1",
            balance: new Decimal(1000.0),
            userId: "usr-src",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        const dest = Account.create({
            id: "dst-1",
            accountNumber: "ACC-DST-1",
            balance: new Decimal(200.0),
            userId: "usr-dst",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(source);
        await accountRepository.save(dest);

        const result = await useCase.execute({
            sourceAccountId: "src-1",
            destinationAccountId: "dst-1",
            amount: 300.0,
        });

        expect(result).toBeDefined();
        expect(result.amount).toBe(300.0);
        expect(result.sourceAccountId).toBe("src-1");
        expect(result.destinationAccountId).toBe("dst-1");

        expect(source.balance.equals(new Decimal(700.0))).toBe(true);
        expect(dest.balance.equals(new Decimal(500.0))).toBe(true);
    });

    it("Error al transferir monto negativo o cero", async () => {
        await expect(
            useCase.execute({
                sourceAccountId: "src-1",
                destinationAccountId: "dst-1",
                amount: -10,
            })
        ).rejects.toThrow(InvalidAmountError);
    });

    it("Error al transferir a la misma cuenta de origen", async () => {
        await expect(
            useCase.execute({
                sourceAccountId: "src-1",
                destinationAccountId: "src-1",
                amount: 100,
            })
        ).rejects.toThrow(InvalidPropValueError);
    });

    it("Error cuando la cuenta de origen no existe", async () => {
        await expect(
            useCase.execute({
                sourceAccountId: "non-existent",
                destinationAccountId: "dst-1",
                amount: 100,
            })
        ).rejects.toThrow(AccountNotFoundError);
    });

    it("Error por saldo insuficiente en la cuenta origen", async () => {
        const source = Account.create({
            id: "src-broke",
            accountNumber: "ACC-BROKE",
            balance: new Decimal(50.0),
            userId: "usr-src",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        const dest = Account.create({
            id: "dst-rich",
            accountNumber: "ACC-RICH",
            balance: new Decimal(200.0),
            userId: "usr-dst",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(source);
        await accountRepository.save(dest);

        await expect(
            useCase.execute({
                sourceAccountId: "src-broke",
                destinationAccountId: "dst-rich",
                amount: 500,
            })
        ).rejects.toThrow(InsufficientBalanceError);
    });
});


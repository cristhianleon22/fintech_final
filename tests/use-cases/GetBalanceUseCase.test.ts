import { describe, it, expect, beforeEach } from "vitest";
import { GetBalanceUseCase } from "../../src/use-cases/GetBalanceUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import { AccountNotFoundError } from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("GetBalanceUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: GetBalanceUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new GetBalanceUseCase(accountRepository);
    });

    it("Escenario 1: Consulta exitosa cuando la Cuenta Existe", async () => {
        const account = Account.create({
            id: "acc-existing-1",
            accountNumber: "ACC-100200300",
            balance: new Decimal(1250.75),
            userId: "usr-001",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        const result = await useCase.execute({ accountId: "acc-existing-1" });

        expect(result).toBeDefined();
        expect(result.id).toBe("acc-existing-1");
        expect(result.accountNumber).toBe("ACC-100200300");
        expect(result.balance.equals(new Decimal(1250.75))).toBe(true);
        expect(result.status).toBe("ACTIVE");
        expect(result.userId).toBe("usr-001");
    });

    it("Escenario 2: Error cuando la Cuenta No Existe", async () => {
        await expect(useCase.execute({ accountId: "acc-non-existent" })).rejects.toThrow(AccountNotFoundError);
    });
});


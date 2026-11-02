import { describe, it, expect, beforeEach } from "vitest";
import { UnfreezeAccountUseCase } from "../../src/use-cases/UnfreezeAccountUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import { InvalidPropValueError } from "../../src/domain/exceptions/DomainError";
import { Decimal } from "decimal.js";

describe("UnfreezeAccountUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: UnfreezeAccountUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new UnfreezeAccountUseCase(accountRepository);
    });

    it("Escenario 1: Descongelar Cuenta Congelada cambia su estado a ACTIVE exitosamente", async () => {
        const frozenAccount = Account.create({
            id: "acc-frozen-to-active",
            accountNumber: "ACC-888999",
            balance: new Decimal(300.0),
            userId: "usr-60",
            status: "FROZEN",
            createdAt: new Date(),
        });
        await accountRepository.save(frozenAccount);

        const result = await useCase.execute({ accountId: "acc-frozen-to-active" });

        expect(result).toBeDefined();
        expect(result.accountId).toBe("acc-frozen-to-active");
        expect(result.status).toBe("ACTIVE");

        const updated = await accountRepository.findById("acc-frozen-to-active");
        expect(updated!.status).toBe("ACTIVE");
        expect(updated!.isActive()).toBe(true);
    });

    it("Escenario 2: Error al intentar Descongelar una Cuenta ya Activa", async () => {
        const activeAccount = Account.create({
            id: "acc-already-active",
            accountNumber: "ACC-101102",
            balance: new Decimal(400.0),
            userId: "usr-70",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(activeAccount);

        await expect(
            useCase.execute({ accountId: "acc-already-active" })
        ).rejects.toThrow(InvalidPropValueError);
    });
});


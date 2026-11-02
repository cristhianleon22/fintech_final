import { describe, it, expect, beforeEach } from "vitest";
import { FreezeAccountUseCase } from "../../src/use-cases/FreezeAccountUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { Account } from "../../src/domain/entities/Account";
import { InvalidPropValueError } from "../../src/domain/exceptions/DomainError";
import { Decimal } from "decimal.js";

describe("FreezeAccountUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: FreezeAccountUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new FreezeAccountUseCase(accountRepository);
    });

    it("Escenario 1: Congelar Cuenta Activa cambia su estado a FROZEN exitosamente", async () => {
        const account = Account.create({
            id: "acc-active-to-freeze",
            accountNumber: "ACC-444555",
            balance: new Decimal(100.0),
            userId: "usr-40",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await accountRepository.save(account);

        const result = await useCase.execute({ accountId: "acc-active-to-freeze" });

        expect(result).toBeDefined();
        expect(result.accountId).toBe("acc-active-to-freeze");
        expect(result.status).toBe("FROZEN");

        const updated = await accountRepository.findById("acc-active-to-freeze");
        expect(updated!.status).toBe("FROZEN");
        expect(updated!.isFrozen()).toBe(true);
    });

    it("Escenario 2: Error al intentar Congelar una Cuenta ya Congelada", async () => {
        const alreadyFrozen = Account.create({
            id: "acc-already-frozen",
            accountNumber: "ACC-666777",
            balance: new Decimal(200.0),
            userId: "usr-50",
            status: "FROZEN",
            createdAt: new Date(),
        });
        await accountRepository.save(alreadyFrozen);

        await expect(
            useCase.execute({ accountId: "acc-already-frozen" })
        ).rejects.toThrow(InvalidPropValueError);
    });
});


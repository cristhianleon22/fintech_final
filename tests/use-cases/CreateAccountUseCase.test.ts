import { describe, it, expect, beforeEach } from "vitest";
import { CreateAccountUseCase } from "../../src/use-cases/CreateAccountUseCase";
import { MockAccountRepository } from "../mocks/MockAccountRepository";
import { InvalidAmountError } from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("CreateAccountUseCase", () => {
    let accountRepository: MockAccountRepository;
    let useCase: CreateAccountUseCase;

    beforeEach(() => {
        accountRepository = new MockAccountRepository();
        useCase = new CreateAccountUseCase(accountRepository);
    });

    it("Escenario 1: Creación Exitosa con Balance inicial", async () => {
        const input = {
            userId: "usr-123456",
            initialBalance: 500.0,
        };

        const result = await useCase.execute(input);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.accountNumber).toMatch(/^ACC-\d+/);
        expect(result.balance.equals(new Decimal(500.0))).toBe(true);
        expect(result.status).toBe("ACTIVE");
        expect(result.userId).toBe("usr-123456");

        // Verificar persistencia
        const savedAccount = await accountRepository.findById(result.id!);
        expect(savedAccount).not.toBeNull();
        expect(savedAccount!.balance.equals(new Decimal(500.0))).toBe(true);
    });

    it("Escenario 2: Creación Exitosa Sin Balance (balance inicial 0 por defecto)", async () => {
        const input = {
            userId: "usr-789012",
        };

        const result = await useCase.execute(input);

        expect(result).toBeDefined();
        expect(result.balance.equals(new Decimal(0))).toBe(true);
        expect(result.status).toBe("ACTIVE");
        expect(result.userId).toBe("usr-789012");

        const savedAccount = await accountRepository.findById(result.id!);
        expect(savedAccount).not.toBeNull();
        expect(savedAccount!.balance.equals(new Decimal(0))).toBe(true);
    });

    it("Escenario 3: Error al intentar crear con Monto Negativo", async () => {
        const input = {
            userId: "usr-fail",
            initialBalance: -100.0,
        };

        await expect(useCase.execute(input)).rejects.toThrow(InvalidAmountError);
        expect(accountRepository.accounts.size).toBe(0);
    });
});


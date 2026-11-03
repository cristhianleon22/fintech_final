import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUserUseCase } from "../../src/use-cases/RegisterUserUseCase";
import { MockUserRepository } from "../mocks/MockUserRepository";
import { CryptoPasswordHasher } from "../../src/infrastructure/services/CryptoPasswordHasher";
import { UserAlreadyExistsError, InvalidPropValueError } from "../../src/domain/exceptions/DomainError";

describe("RegisterUserUseCase", () => {
    let userRepository: MockUserRepository;
    let passwordHasher: CryptoPasswordHasher;
    let useCase: RegisterUserUseCase;

    beforeEach(() => {
        userRepository = new MockUserRepository();
        passwordHasher = new CryptoPasswordHasher();
        useCase = new RegisterUserUseCase(userRepository, passwordHasher);
    });

    it("Registro exitoso de nuevo usuario con datos válidos", async () => {
        const input = {
            email: "nuevo.usuario@fintech.com",
            password: "Password123#",
            fullName: "Carlos Mendoza",
        };

        const result = await useCase.execute(input);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.email).toBe("nuevo.usuario@fintech.com");
        expect(result.fullName).toBe("Carlos Mendoza");
        expect(result.status).toBe("ACTIVE");

        // Verificar que en base de datos la contraseña esté hasheada (no en texto plano)
        const savedInDb = await userRepository.findById(result.id);
        expect(savedInDb).not.toBeNull();
        expect(savedInDb!.password).not.toBe(input.password);
        expect(savedInDb!.password).toContain(":");

        // Verificar que el hash sea verificable con el hasher
        const isMatch = await passwordHasher.compare(input.password, savedInDb!.password);
        expect(isMatch).toBe(true);
    });

    it("Error al intentar registrar un email duplicado", async () => {
        const input = {
            email: "existente@fintech.com",
            password: "Password123#",
            fullName: "Laura Gomez",
        };

        await useCase.execute(input);

        // Segundo intento con el mismo email
        await expect(useCase.execute(input)).rejects.toThrow(UserAlreadyExistsError);
    });

    it("Error al intentar registrar con contraseña débil", async () => {
        const input = {
            email: "debil@fintech.com",
            password: "123", // No cumple con la fortaleza
            fullName: "Pedro Perez",
        };

        await expect(useCase.execute(input)).rejects.toThrow(InvalidPropValueError);
    });

    it("Error al registrar con formato de email inválido", async () => {
        const input = {
            email: "correo-invalido",
            password: "Password123#",
            fullName: "Andres Castro",
        };

        await expect(useCase.execute(input)).rejects.toThrow(InvalidPropValueError);
    });
});


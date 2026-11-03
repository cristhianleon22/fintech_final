import { describe, it, expect, beforeEach } from "vitest";
import { LoginUseCase } from "../../src/use-cases/LoginUseCase";
import { MockUserRepository } from "../mocks/MockUserRepository";
import { CryptoPasswordHasher } from "../../src/infrastructure/services/CryptoPasswordHasher";
import { User } from "../../src/domain/entities/User";
import { InvalidCredentialsError, UserInactiveError } from "../../src/domain/exceptions/DomainError";

describe("LoginUseCase", () => {
    let userRepository: MockUserRepository;
    let passwordHasher: CryptoPasswordHasher;
    let useCase: LoginUseCase;

    beforeEach(async () => {
        userRepository = new MockUserRepository();
        passwordHasher = new CryptoPasswordHasher();
        useCase = new LoginUseCase(userRepository, passwordHasher);

        // Pre-cargar un usuario activo con contraseña hasheada
        const passwordHash = await passwordHasher.hash("SecurePass123@");
        const activeUser = User.reconstitute({
            id: "usr-active-1",
            email: "activo@fintech.com",
            password: passwordHash,
            fullName: "Usuario Activo",
            status: "ACTIVE",
            createdAt: new Date(),
        });
        await userRepository.save(activeUser);

        // Pre-cargar un usuario inactivo
        const inactiveUser = User.reconstitute({
            id: "usr-inactive-1",
            email: "inactivo@fintech.com",
            password: passwordHash,
            fullName: "Usuario Inactivo",
            status: "INACTIVE",
            createdAt: new Date(),
        });
        await userRepository.save(inactiveUser);
    });

    it("Login exitoso con correo y contraseña correctos", async () => {
        const result = await useCase.execute({
            email: "activo@fintech.com",
            password: "SecurePass123@",
        });

        expect(result).toBeDefined();
        expect(result.id).toBe("usr-active-1");
        expect(result.email).toBe("activo@fintech.com");
        expect(result.fullName).toBe("Usuario Activo");
        expect(result.status).toBe("ACTIVE");
    });

    it("Error al intentar iniciar sesión con un correo no registrado", async () => {
        await expect(
            useCase.execute({
                email: "no.existe@fintech.com",
                password: "SecurePass123@",
            })
        ).rejects.toThrow(InvalidCredentialsError);
    });

    it("Error al intentar iniciar sesión con una contraseña incorrecta", async () => {
        await expect(
            useCase.execute({
                email: "activo@fintech.com",
                password: "WrongPassword999#",
            })
        ).rejects.toThrow(InvalidCredentialsError);
    });

    it("Error cuando el usuario se encuentra inactivo", async () => {
        await expect(
            useCase.execute({
                email: "inactivo@fintech.com",
                password: "SecurePass123@",
            })
        ).rejects.toThrow(UserInactiveError);
    });
});


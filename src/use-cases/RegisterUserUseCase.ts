import { UserRepository } from "../domain/repositories/UserRepository";
import { User } from "../domain/entities/User";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { UserAlreadyExistsError } from "../domain/exceptions/DomainError";
import { RegisterUserInputDTO, RegisterUserOutputDTO } from "./dto/UserDTOs";

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher
    ) { }

    async execute(input: RegisterUserInputDTO): Promise<RegisterUserOutputDTO> {
        const normalizedEmail = input.email.trim().toLowerCase();

        // 1. Validar que el usuario no exista previamente con el mismo email
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new UserAlreadyExistsError(normalizedEmail);
        }

        // 2. Validar las invariantes de negocio (formato de correo, fortaleza de contraseña y nombre alfabético)
        const validatedUser = User.create({
            id: crypto.randomUUID(),
            email: normalizedEmail,
            password: input.password,
            fullName: input.fullName,
            status: "ACTIVE",
            createdAt: new Date(),
        });

        // 3. Hashear la contraseña para almacenamiento seguro
        const passwordHash = await this.passwordHasher.hash(input.password);

        // 4. Reconstituir la entidad portando el hash seguro para la base de datos
        const userToSave = User.reconstitute({
            id: validatedUser.id,
            email: validatedUser.email,
            password: passwordHash,
            fullName: validatedUser.fullName,
            status: validatedUser.status,
            createdAt: validatedUser.createdAt,
        });

        // 5. Persistir en el repositorio
        await this.userRepository.save(userToSave);

        return {
            id: userToSave.id,
            email: userToSave.email,
            fullName: userToSave.fullName,
            status: userToSave.status,
            createdAt: userToSave.createdAt,
        };
    }
}


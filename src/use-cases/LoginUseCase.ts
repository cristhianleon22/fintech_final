import { UserRepository } from "../domain/repositories/UserRepository";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { InvalidCredentialsError, UserInactiveError } from "../domain/exceptions/DomainError";
import { LoginInputDTO, LoginOutputDTO } from "./dto/UserDTOs";

export class LoginUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher
    ) { }

    async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
        const normalizedEmail = input.email.trim().toLowerCase();

        // 1. Buscar usuario por email
        const user = await this.userRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // 2. Validar que la contraseña en texto plano coincida con el hash
        const isPasswordValid = await this.passwordHasher.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        // 3. Validar que la cuenta del usuario no se encuentre inactiva
        if (user.isInactive()) {
            throw new UserInactiveError(user.id);
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
        };
    }
}


import { UserRepository } from "../domain/repositories/UserRepository";
import { PasswordHasher } from "../domain/services/PasswordHasher";
import { JwtTokenService } from "../infrastructure/services/JwtTokenService";
import { InvalidCredentialsError, UserInactiveError } from "../domain/exceptions/DomainError";
import { LoginInputDTO, LoginOutputDTO } from "./dto/UserDTOs";

export class LoginUseCase {
    private readonly userRepository: UserRepository;
    private readonly tokenService?: JwtTokenService;
    private readonly passwordHasher: PasswordHasher;

    constructor(
        userRepository: UserRepository,
        tokenServiceOrHasher: JwtTokenService | PasswordHasher,
        passwordHasher?: PasswordHasher
    ) {
        this.userRepository = userRepository;
        if (passwordHasher) {
            this.tokenService = tokenServiceOrHasher as JwtTokenService;
            this.passwordHasher = passwordHasher;
        } else {
            this.passwordHasher = tokenServiceOrHasher as PasswordHasher;
        }
    }

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

        // 4. Generar token de sesión si el servicio de token está provisto
        const token = this.tokenService
            ? this.tokenService.generateToken({ userId: user.id, email: user.email })
            : undefined;

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            status: user.status,
            token,
        };
    }
}

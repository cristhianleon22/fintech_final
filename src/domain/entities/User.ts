import { InvalidPropValueError } from "../exceptions/DomainError";

export interface UserProps {
    id?: string;
    email: string;
    password: string;
    fullName: string;
    createdAt?: Date;
}

export class User {
    private readonly props: UserProps;

    // Constructor privado: fuerza el uso del Factory Method 'create'
    private constructor(props: UserProps) {
        this.props = props;
    }

    public static create(props: UserProps): User {
        // Invariante: Formato de correo electrónico válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(props.email)) {
            throw new InvalidPropValueError(`El email [${props.email}] no es válido.`);
        }

        // Invariante: Fortaleza mínima de contraseña (al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(props.password)) {
            throw new InvalidPropValueError("La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.");
        }

        // Invariante: Nombre completo debe contener caracteres alfabéticos válidos
        const fullNameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s']+$/;
        if (!fullNameRegex.test(props.fullName.trim()) || props.fullName.trim().length < 3) {
            throw new InvalidPropValueError(`El nombre [${props.fullName}] no es válido (mínimo 3 caracteres alfabéticos).`);
        }

        // Invariante: Fecha de creación válida
        const createdAt = props.createdAt ?? new Date();
        if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
            throw new InvalidPropValueError("La fecha de creación no es válida.");
        }

        return new User({
            ...props,
            fullName: props.fullName.trim(),
            createdAt
        });
    }

    // --- GETTERS ESTANDARIZADOS (TS Idiomático) ---
    get id(): string {
        return this.props.id ?? '';
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }

    get fullName(): string {
        return this.props.fullName;
    }

    get createdAt(): Date {
        return this.props.createdAt ?? new Date();
    }

    // Métodos accesorios para máxima compatibilidad
    public getId(): string { return this.id; }
    public getEmail(): string { return this.email; }
    public getPassword(): string { return this.password; }
    public getFullName(): string { return this.fullName; }
    public getCreatedAt(): Date { return this.createdAt; }
}
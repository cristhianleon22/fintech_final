import { InvalidPropValueError } from "../exceptions/DomainError";

export interface UserProps {
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdAt: Date;
};

export class User {
    private readonly props: UserProps;

    constructor(props: UserProps) {
        this.props = props;
    }

    public static create(props: UserProps): User {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(props.email)) {
            throw new InvalidPropValueError(`El email ${props.email} no es válido`);
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;// valida que la contraseña tenga al menos una mayuscula, una minuscula, un numero y un caracter especial

        if (!passwordRegex.test(props.password)) {
            throw new InvalidPropValueError(`El password ${props.password} no es válido`);
        }
        const fullNameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s']+$/; // valida que solo sean letras y espacios
        if (!fullNameRegex.test(props.fullName)) {
            throw new InvalidPropValueError(`El nombre ${props.fullName} no es válido`);
        }
        const createdAtRegex = /^\d{4}-\d{2}-\d{2}$/; // formato de fecha yyyy-mm-dd
        if (!createdAtRegex.test(props.createdAt.toISOString())) {
            throw new InvalidPropValueError(`La fecha de creación ${props.createdAt} no es válida`);
        }

        return new User(props);
    }
    //getters

    public getId(): string {
        return this.props.id;
    }

    public getEmail(): string {
        return this.props.email;
    }

    public getPassword(): string {
        return this.props.password;
    }

    public getFullName(): string {
        return this.props.fullName;
    }

    public getCreatedAt(): Date {
        return this.props.createdAt;
    }





}
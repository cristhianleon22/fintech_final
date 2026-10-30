import { Decimal } from 'decimal.js';
import {
    InsufficientBalanceError,
    AccountFrozenError,
    InvalidAmountError
} from '../exceptions/FinancialError';
import { InvalidPropValueError } from '../exceptions/DomainError';

export type AccountStatus = 'ACTIVE' | 'FROZEN';

export interface AccountProps {
    id?: string;
    accountNumber: string;
    balance: Decimal; // Blindaje contra el problema de punto flotante
    userId: string;
    status: AccountStatus;
    createdAt?: Date;
}

export class Account {
    private props: AccountProps;

    private constructor(props: AccountProps) {
        this.props = props;
    }

    public static create(props: AccountProps): Account {
        // Invariante: Número de cuenta obligatorio
        if (!props.accountNumber || props.accountNumber.trim().length === 0) {
            throw new InvalidPropValueError('El número de cuenta no puede estar vacío.');
        }

        // Invariante: UserId obligatorio
        if (!props.userId || props.userId.trim().length === 0) {
            throw new InvalidPropValueError('El identificador del usuario propietario es obligatorio.');
        }

        // Invariante Financiera: El sistema prohíbe aperturas de cuentas con saldo negativo
        if (props.balance.isNegative()) {
            throw new InvalidAmountError('Una cuenta no puede ser inicializada con saldo negativo.');
        }

        const createdAt = props.createdAt ?? new Date();

        return new Account({
            ...props,
            accountNumber: props.accountNumber.trim(),
            createdAt
        });
    }

    // --- GETTERS ESTANDARIZADOS ---
    get id(): string { return this.props.id ?? ''; }
    get accountNumber(): string { return this.props.accountNumber; }
    get balance(): Decimal { return this.props.balance; }
    get userId(): string { return this.props.userId; }
    get status(): AccountStatus { return this.props.status; }
    get createdAt(): Date { return this.props.createdAt ?? new Date(); }

    // --- MÉTODOS DE CONSULTA DE ESTADO ---
    public isActive(): boolean {
        return this.props.status === 'ACTIVE';
    }

    public isFrozen(): boolean {
        return this.props.status === 'FROZEN';
    }

    // --- COMPORTAMIENTOS DEL DOMINIO (MODELO RICO) ---

    public deposit(amount: Decimal): void {
        if (amount.lte(0)) {
            throw new InvalidAmountError('El monto del depósito debe ser estrictamente mayor a cero.');
        }

        if (this.isFrozen()) {
            throw new AccountFrozenError(this.id || this.accountNumber);
        }

        // Mutación controlada internamente con precisión decimal
        this.props.balance = this.props.balance.plus(amount);
    }

    public withdraw(amount: Decimal): void {
        if (amount.lte(0)) {
            throw new InvalidAmountError('El monto del retiro debe ser estrictamente mayor a cero.');
        }

        if (this.isFrozen()) {
            throw new AccountFrozenError(this.id || this.accountNumber);
        }

        if (this.props.balance.lessThan(amount)) {
            throw new InsufficientBalanceError(this.id || this.accountNumber);
        }

        this.props.balance = this.props.balance.minus(amount);
    }

    public freeze(): void {
        this.props.status = 'FROZEN';
    }

    public unfreeze(): void {
        this.props.status = 'ACTIVE';
    }
}
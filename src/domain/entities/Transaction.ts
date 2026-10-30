import { Decimal } from "decimal.js";
import { InvalidPropValueError } from "../exceptions/DomainError";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

export interface TransactionProps {
    id?: string;
    amount: Decimal;
    status: TransactionStatus;
    description: string;
    createdAt?: Date;
}

/**
 * Clase Abstracta Base: Define el contrato y reglas universales
 * para cualquier movimiento financiero en el Core Fintech.
 */
export abstract class Transaction {
    private readonly props: TransactionProps;

    protected constructor(props: TransactionProps) {
        this.props = {
            ...props,
            createdAt: props.createdAt ?? new Date()
        };
    }

    public static validateAmount(props: TransactionProps, errorMessage: string): void {
        if (props.amount.lte(0)) {
            throw new InvalidPropValueError(errorMessage);
        }
    }

    // Getters universales
    get id(): string { return this.props.id ?? ''; }
    get amount(): Decimal { return this.props.amount; }
    get status(): TransactionStatus { return this.props.status; }
    get description(): string { return this.props.description; }
    get createdAt(): Date { return this.props.createdAt ?? new Date(); }

    // Tipo polimórfico de transacción
    abstract get type(): TransactionType;

    // Métodos de ciclo de vida
    public markAsCompleted(): void {
        this.props.status = "COMPLETED";
    }

    public markAsFailed(): void {
        this.props.status = "FAILED";
    }

    public isPending(): boolean {
        return this.props.status === "PENDING";
    }

    public isCompleted(): boolean {
        return this.props.status === "COMPLETED";
    }

    public isFailed(): boolean {
        return this.props.status === "FAILED";
    }
}

// ========================================================
// 1. SUBCLASE DEPOSITO (Deposit)
// ========================================================

export interface DepositProps extends TransactionProps {
    destinationAccountId: string;
}

export class Deposit extends Transaction {
    private readonly destinationAccountId: string;

    private constructor(props: DepositProps) {
        super(props);
        this.destinationAccountId = props.destinationAccountId;
    }

    public static create(props: DepositProps): Deposit {
        if (!props.destinationAccountId || props.destinationAccountId.trim().length === 0) {
            throw new InvalidPropValueError("La cuenta de destino del depósito es obligatoria.");
        }

        Transaction.validateAmount(props, "El monto del depósito debe ser mayor que cero.");
        return new Deposit(props);
    }

    get type(): TransactionType {
        return "DEPOSIT";
    }

    get destinationAccount(): string {
        return this.destinationAccountId;
    }
}

// ========================================================
// 2. SUBCLASE RETIRO (Withdrawal)
// ========================================================

export interface WithdrawalProps extends TransactionProps {
    sourceAccountId: string;
}

export class Withdrawal extends Transaction {
    private readonly sourceAccountId: string;

    private constructor(props: WithdrawalProps) {
        super(props);
        this.sourceAccountId = props.sourceAccountId;
    }

    public static create(props: WithdrawalProps): Withdrawal {
        if (!props.sourceAccountId || props.sourceAccountId.trim().length === 0) {
            throw new InvalidPropValueError("La cuenta de origen del retiro es obligatoria.");
        }

        Transaction.validateAmount(props, "El monto del retiro debe ser mayor que cero.");
        return new Withdrawal(props);
    }

    get type(): TransactionType {
        return "WITHDRAWAL";
    }

    get sourceAccount(): string {
        return this.sourceAccountId;
    }
}

// ========================================================
// 3. SUBCLASE TRANSFERENCIA (Transfer)
// ========================================================

export interface TransferProps extends TransactionProps {
    sourceAccountId: string;
    destinationAccountId: string;
}

export class Transfer extends Transaction {
    private readonly sourceAccountId: string;
    private readonly destinationAccountId: string;

    private constructor(props: TransferProps) {
        super(props);
        this.sourceAccountId = props.sourceAccountId;
        this.destinationAccountId = props.destinationAccountId;
    }

    public static create(props: TransferProps): Transfer {
        if (!props.sourceAccountId || props.sourceAccountId.trim().length === 0) {
            throw new InvalidPropValueError("La cuenta de origen de la transferencia es obligatoria.");
        }

        if (!props.destinationAccountId || props.destinationAccountId.trim().length === 0) {
            throw new InvalidPropValueError("La cuenta de destino de la transferencia es obligatoria.");
        }

        if (props.sourceAccountId === props.destinationAccountId) {
            throw new InvalidPropValueError("La cuenta de origen y destino no pueden ser la misma.");
        }

        Transaction.validateAmount(props, "El monto de la transferencia debe ser mayor que cero.");

        return new Transfer(props);
    }

    get type(): TransactionType {
        return "TRANSFER";
    }

    get sourceAccount(): string {
        return this.sourceAccountId;
    }

    get destinationAccount(): string {
        return this.destinationAccountId;
    }
}
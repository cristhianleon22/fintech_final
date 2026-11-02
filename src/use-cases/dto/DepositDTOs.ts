import { Decimal } from "decimal.js";

export interface DepositInputDTO {
    accountId: string;
    amount: number;
}

export interface DepositOutputDTO {
    accountId: string;
    accountNumber: string;
    newBalance: Decimal;
    status: string;
}


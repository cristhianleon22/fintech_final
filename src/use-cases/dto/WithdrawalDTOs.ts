import { Decimal } from "decimal.js";

export interface WithdrawalInputDTO {
    accountId: string;
    amount: number;
}

export interface WithdrawalOutputDTO {
    accountId: string;
    accountNumber: string;
    newBalance: Decimal;
    status: string;
}


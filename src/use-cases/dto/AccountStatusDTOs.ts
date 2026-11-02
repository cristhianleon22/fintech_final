export interface FreezeAccountInputDTO {
    accountId: string;
}

export interface UnfreezeAccountInputDTO {
    accountId: string;
}

export interface AccountStatusOutputDTO {
    accountId: string;
    accountNumber: string;
    status: string;
}


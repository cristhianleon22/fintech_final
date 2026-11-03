export interface RegisterUserInputDTO {
    email: string;
    password: string;
    fullName: string;
}

export interface RegisterUserOutputDTO {
    id: string;
    email: string;
    fullName: string;
    status: string;
    createdAt: Date;
}

export interface LoginInputDTO {
    email: string;
    password: string;
}

export interface LoginOutputDTO {
    id: string;
    email: string;
    fullName: string;
    status: string;
    token?: string;
}


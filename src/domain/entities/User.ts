import { error } from "node:console";

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
            throw new Error(`El email ${props.email} no es válido`);
        }

        return new User(props);
    }



}
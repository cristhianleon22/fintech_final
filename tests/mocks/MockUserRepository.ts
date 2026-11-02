import { UserRepository } from "../../src/domain/repositories/UserRepository";
import { User } from "../../src/domain/entities/User";

export class MockUserRepository implements UserRepository {
    public users: Map<string, User> = new Map();

    async findById(id: string): Promise<User | null> {
        return this.users.get(id) ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                return user;
            }
        }
        return null;
    }

    async save(user: User): Promise<void> {
        this.users.set(user.id, user);
    }

    async update(user: User): Promise<void> {
        this.users.set(user.id, user);
    }
}


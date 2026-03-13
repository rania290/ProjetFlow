import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user-repository.interface';
export declare class InMemoryUserRepository implements UserRepository {
    private users;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
}

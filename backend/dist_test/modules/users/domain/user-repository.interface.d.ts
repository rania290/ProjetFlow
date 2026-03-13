import { User } from './user.entity';
export interface UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    delete(id: string): Promise<void>;
}
export declare const USER_REPOSITORY = "USER_REPOSITORY";

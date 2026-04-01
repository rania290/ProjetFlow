import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../model/users.model';
import { UserRole } from '../constants/users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      return existingUser;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.TEAM_MEMBER,
    });

    return this.userRepository.save(user);
  }

  async createOrUpdate(userData: {
    email: string;
    password?: string;
    fullName: string;
    role?: UserRole;
  }): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (user) {
      if (userData.fullName !== user.fullName) {
        user.fullName = userData.fullName;
      }
      if (userData.role && userData.role !== user.role) {
        user.role = userData.role;
      }
      if (userData.password) {
        user.password = await bcrypt.hash(userData.password, 10);
      }
      return this.userRepository.save(user);
    } else {
      const hashedPassword = await bcrypt.hash(
        userData.password || 'password123',
        10,
      );

      user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
        role: userData.role || UserRole.TEAM_MEMBER,
      });

      return this.userRepository.save(user);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    console.log(`[UsersService] findById: searching for ${id}`);
    const user = await this.userRepository.findOne({ where: { id } });
    console.log(`[UsersService] findById: result for ${id} is ${user ? 'FOUND' : 'NOT FOUND'}`);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    console.log(`[UsersService] update: starting update for ${id}`);
    
    // 1. Manually fetch the user to ensure it exists
    const user = await this.findById(id);
    if (!user) {
      console.error(`[UsersService] update: USER NOT FOUND in database: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 2. Perform the update (manual merge to prevent ID overwrites)
    Object.assign(user, updateData);
    
    // 3. Save the full entity
    const updated = await this.userRepository.save(user);
    console.log(`[UsersService] update: SUCCESS for ${id}`);
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}


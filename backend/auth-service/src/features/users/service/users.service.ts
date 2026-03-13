import { Injectable } from '@nestjs/common';
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
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
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


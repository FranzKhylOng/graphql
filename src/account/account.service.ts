import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './account.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(User.name) private model: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(user: User) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return await this.model.create({ ...user, password: hashedPassword });
  }

  async update(id: string, updates: User) {
    return this.model.findByIdAndUpdate(id, updates);
  }

  async retrieve(params: { id?: string; username?: string }) {
    if (params.id) {
      return this.model.findById(params.id);
    }
    if (params.username) {
      return this.model.findOne({ username: params.username });
    }
    return null;
  }

  async delete(id: string) {
    this.model.findByIdAndDelete(id);
  }

  async generateToken(user: UserDocument) {
    const payload = { username: user.emailAdress, sub: user._id };
    return this.jwtService.signAsync(payload);
  }

  async login(email: string, password: string) {
    const user = await this.model.findOne({ emailAddress: email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './account.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  async create(user: User) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return await this.model.create({ ...user, password: hashedPassword });
  }

  update(id: string, updates: User) {
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

  delete(id: string) {
    this.model.findByIdAndDelete(id);
  }
}

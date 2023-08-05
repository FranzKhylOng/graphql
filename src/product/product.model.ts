import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../account/account.model';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop()
  name: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

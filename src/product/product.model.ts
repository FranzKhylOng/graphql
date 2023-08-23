import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Binary } from '../graphql';

@Schema({
  timestamps: true,
  virtuals: {
    id: {
      get() {
        return this._id;
      },
    },
  },
  toJSON: {
    virtuals: true,
  },
})
export class Product extends Document {
  @Prop()
  name: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  owner: Binary;
  @Prop({
    type: Buffer,
    default: () => {
      return Buffer.from(Date.now().toString());
    },
  })
  cursor: Buffer;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

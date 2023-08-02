import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop()
  name: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop()
  cursor: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

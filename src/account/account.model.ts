import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  firstname: string;
  @Prop()
  lastname: string;
  @Prop()
  emailAdress: string;
  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  emailAddress: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User).index(
  {
    emailAddress: 1,
  },
  { unique: true },
);

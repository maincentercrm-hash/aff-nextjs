import type { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import { compare } from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  status: string;
  createDate: Date;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'guest' },
  status: { type: String, default: 'pending' },
  createDate: { type: Date, default: Date.now },
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await compare(password, this.password);
};

const ModelUser: Model<IUser> = mongoose.models.tbl_users || mongoose.model<IUser>('tbl_users', userSchema);

export default ModelUser;

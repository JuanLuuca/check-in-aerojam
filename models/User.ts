// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  login: string;
  password: string;
  authToken: string;
  perfil: number;
  qtdAulas: number;
}

const UserSchema: Schema = new Schema({
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
    required: true,
  },
  perfil: {
    type: Number,
    required: true,
  },
  qtdAulas: {
    type: Number,
    require: true
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

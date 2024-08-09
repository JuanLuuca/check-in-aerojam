// models/Class.ts
import mongoose from 'mongoose';

export interface IClass extends Document {
  name: string;
  time: string;
  isEnrolled: boolean;
  status: boolean;
  image: File;
}

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: Date, required: true },
  isEnrolled: { type: Boolean, default: false },
  status: { type: Boolean, default: true},
  image: { type: Buffer, required: true },
});

const Class = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
export default Class;

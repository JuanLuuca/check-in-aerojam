import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  classId: mongoose.Schema.Types.ObjectId;
  enrollmentDate: Date;
}

const EnrollmentSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  enrollmentDate: { 
    type: Date, 
    default: Date.now 
  },
});

EnrollmentSchema.pre<IEnrollment>('save', function (next) {
  if (this.isNew) {
    const now = new Date();
    const utc4Date = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    this.enrollmentDate = utc4Date;
  }
  next();
});

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
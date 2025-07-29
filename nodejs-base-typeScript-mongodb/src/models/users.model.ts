import mongoose, { Schema } from 'mongoose';
import { UserDocument } from '@/types/user.type';
import { Role, Status } from '@/enums';

const UserSchema: Schema<UserDocument> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },  // required: true for clarity
  role: { type: String, enum: Role, required: true },
  status: { type: String, enum: Status, default: Status.ACTIVE },
  profileImg: { type: String, default: null },
  // createdAt: { type: Date, default: Date.now }, timestamps: true will create createdAt and updatedAt fields 
  // updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserSchema.pre(['updateMany', 'updateOne', 'findOneAndUpdate'], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.model<UserDocument>('users', UserSchema);
